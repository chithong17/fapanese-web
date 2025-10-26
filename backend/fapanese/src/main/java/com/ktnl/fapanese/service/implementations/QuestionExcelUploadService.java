package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.response.ExcelUploadResponse;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.entity.enums.QuestionCategory;
import com.ktnl.fapanese.entity.enums.QuestionType;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.exception.AppException; // (Import AppException của bạn)
import com.ktnl.fapanese.exception.ErrorCode; // (Import ErrorCode của bạn)
import com.ktnl.fapanese.service.interfaces.IQuestionExcelUploadService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.text.MessageFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuestionExcelUploadService implements IQuestionExcelUploadService {

    QuestionRepository questionRepository;

    // Định nghĩa các cột Excel cho Question
    private static final String HEADER_CONTENT = "content";
    private static final String HEADER_CATEGORY = "category"; // VOCABULARY, GRAMMAR, READING
    private static final String HEADER_TYPE = "questiontype"; // MULTIPLE_CHOICE, FILL, TRUE_FALSE
    private static final String HEADER_OPTION_A = "optiona";
    private static final String HEADER_OPTION_B = "optionb";
    private static final String HEADER_OPTION_C = "optionc";
    private static final String HEADER_OPTION_D = "optiond";
    private static final String HEADER_CORRECT_ANSWER = "correctanswer";
    private static final String HEADER_FILL_ANSWER = "fillanswer";

    @Override
    @Transactional
    public ExcelUploadResponse processQuestionExcel(MultipartFile file) throws IOException {
        ExcelUploadResponse result = new ExcelUploadResponse();
        List<Question> questionsToSave = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            // 1. Validate Header Row
            if (!rowIterator.hasNext()) {
                throw new AppException(ErrorCode.FILE_REQUIRED);
            }
            Row headerRow = rowIterator.next();
            Map<String, Integer> headerMap = mapHeaderToIndex(headerRow);
            validateRequiredHeaders(headerMap); // (Đã cập nhật hàm này bên dưới)

            // 2. Process Data Rows
            int rowNum = 1;
            while (rowIterator.hasNext()) {
                rowNum++;
                result.setTotalRowsProcessed(result.getTotalRowsProcessed() + 1);
                Row currentRow = rowIterator.next();

                if (isRowEmpty(currentRow)) {
                    log.debug("Skipping empty row {}", rowNum);
                    continue;
                }

                try {
                    Question question = new Question();

                    // Lấy các giá trị bắt buộc
                    question.setContent(getStringCellValue(currentRow, headerMap.get(HEADER_CONTENT), rowNum, "Nội dung (Content)", true));
                    String typeStr = getStringCellValue(currentRow, headerMap.get(HEADER_TYPE), rowNum, "Loại (QuestionType)", true);

                    try {
                        question.setQuestionType(QuestionType.valueOf(typeStr.toUpperCase().trim()));
                    } catch (IllegalArgumentException e) {
                        throw new AppException(ErrorCode.EXCEL_INVALID_DATA_TYPE, "QuestionType", typeStr);
                    }

                    // Lấy các giá trị tùy chọn (không còn bắt buộc)
                    question.setCorrectAnswer(getStringCellValue(currentRow, headerMap.get(HEADER_CORRECT_ANSWER), rowNum, "Đáp án đúng (CorrectAnswer)", false)); // Đổi thành false
                    String categoryStr = getStringCellValue(currentRow, headerMap.get(HEADER_CATEGORY), rowNum, "Thể loại (Category)", false); // Đổi thành false

                    // Xử lý Category (Nếu rỗng thì đặt mặc định)
                    if (categoryStr != null && !categoryStr.isEmpty()) {
                        try {
                            question.setCategory(QuestionCategory.valueOf(categoryStr.toUpperCase().trim()));
                        } catch (IllegalArgumentException e) {
                            throw new AppException(ErrorCode.EXCEL_INVALID_DATA_TYPE, "Category", categoryStr);
                        }
                    } else {
                        // Đặt giá trị mặc định nếu category bị thiếu/rỗng
                        question.setCategory(QuestionCategory.VOCABULARY);
                        log.warn("Row {}: Category is missing/empty, defaulting to VOCABULARY.", rowNum);
                    }


                    // Lấy các giá trị tùy chọn dựa trên QuestionType
                    if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                        question.setOptionA(getStringCellValue(currentRow, headerMap.get(HEADER_OPTION_A), rowNum, "OptionA", false));
                        question.setOptionB(getStringCellValue(currentRow, headerMap.get(HEADER_OPTION_B), rowNum, "OptionB", false));
                        question.setOptionC(getStringCellValue(currentRow, headerMap.get(HEADER_OPTION_C), rowNum, "OptionC", false));
                        question.setOptionD(getStringCellValue(currentRow, headerMap.get(HEADER_OPTION_D), rowNum, "OptionD", false));
                    }

                    if (question.getQuestionType() == QuestionType.FILL) {
                        question.setFillAnswer(getStringCellValue(currentRow, headerMap.get(HEADER_FILL_ANSWER), rowNum, "FillAnswer", false));
                    }

                    questionsToSave.add(question);

                } catch (AppException e) {
                    log.warn("Error processing row {}: {}", rowNum, e.getMessage(), e);

                    String formattedMessage = e.getErrorCode().getMessage(); // Lấy message thô (ví dụ: "Cột {0} không được để trống.")

                    // Sử dụng e.getArgs() thay vì e.getParams()
                    if (e.getArgs() != null && e.getArgs().length > 0) {
                        try {
                            // MessageFormat.format sẽ thay thế {0}, {1} bằng các args
                            formattedMessage = MessageFormat.format(formattedMessage, e.getArgs());
                        } catch (Exception formatEx) {
                            // Nếu format lỗi, dùng message gốc
                            log.error("Cannot format error message: {}", e.getMessage(), formatEx);
                            // formattedMessage vẫn là e.getErrorCode().getMessage()
                        }
                    }

                    result.addErrorMessage(rowNum, formattedMessage);
                } catch (Exception e) {
                    log.error("Unexpected error processing row {}", rowNum, e);
                    result.addErrorMessage(rowNum, "Lỗi không xác định: " + e.getMessage());
                }
            } // End row iteration

            // 3. Batch Save to Database
            if (!questionsToSave.isEmpty()) {
                try {
                    questionRepository.saveAll(questionsToSave);
                    result.setSuccessCount(questionsToSave.size());
                    log.info("Successfully saved {} questions from Excel.", questionsToSave.size());

                } catch (Exception e) {
                    log.error("Error during batch saving questions", e);
                    result.setErrorMessages(new ArrayList<>());
                    result.setFailureCount(result.getTotalRowsProcessed());
                    result.setSuccessCount(0);
                    result.addErrorMessage(0, "Lỗi hệ thống khi lưu dữ liệu. " + e.getMessage());
                }
            } else if (result.getFailureCount() == 0) {
                if (result.getTotalRowsProcessed() == 0) {
                    result.addErrorMessage(0, "Không tìm thấy dòng dữ liệu hợp lệ nào trong file.");
                }
            }

        } // End try-with-resources

        log.info("Question Excel processing finished. Total: {}, Success: {}, Failure: {}",
                result.getTotalRowsProcessed(), result.getSuccessCount(), result.getFailureCount());
        return result;
    }

    // --- Helper Methods (Sao chép từ ExcelUploadService của bạn) ---

    private Map<String, Integer> mapHeaderToIndex(Row headerRow) {
        Map<String, Integer> headerMap = new HashMap<>();
        if (headerRow == null) return headerMap;
        for (Cell cell : headerRow) {
            if (cell != null && cell.getCellType() == CellType.STRING) {
                String headerText = cell.getStringCellValue().toLowerCase().trim().replaceAll("\\s+", ""); // Normalize header
                headerMap.put(headerText, cell.getColumnIndex());

                // Thêm các alias (tên thay thế) cho tiêu đề cột
                if (headerText.equals("type") || headerText.equals("loaicuahoi")) {
                    headerMap.putIfAbsent(HEADER_TYPE, cell.getColumnIndex());
                }
                if (headerText.equals("noidung")) {
                    headerMap.putIfAbsent(HEADER_CONTENT, cell.getColumnIndex());
                }
                if (headerText.equals("theloai")) {
                    headerMap.putIfAbsent(HEADER_CATEGORY, cell.getColumnIndex());
                }
                if (headerText.equals("dapandung")) {
                    headerMap.putIfAbsent(HEADER_CORRECT_ANSWER, cell.getColumnIndex());
                }
                if (headerText.equals("dapandien")) {
                    headerMap.putIfAbsent(HEADER_FILL_ANSWER, cell.getColumnIndex());
                }
                if (headerText.equals("a")) {
                    headerMap.putIfAbsent(HEADER_OPTION_A, cell.getColumnIndex());
                }
                if (headerText.equals("b")) {
                    headerMap.putIfAbsent(HEADER_OPTION_B, cell.getColumnIndex());
                }
                if (headerText.equals("c")) {
                    headerMap.putIfAbsent(HEADER_OPTION_C, cell.getColumnIndex());
                }
                if (headerText.equals("d")) {
                    headerMap.putIfAbsent(HEADER_OPTION_D, cell.getColumnIndex());
                }
            }
        }
        return headerMap;
    }

    /**
     * CẬP NHẬT: Chỉ yêu cầu 2 cột 'content' và 'questiontype'
     */
    private void validateRequiredHeaders(Map<String, Integer> headerMap) throws AppException {
        List<String> required = List.of(HEADER_CONTENT, HEADER_TYPE);
        for (String reqHeader : required) {
            if (!headerMap.containsKey(reqHeader)) {
                log.warn("Missing required header: {}", reqHeader);
                throw new AppException(ErrorCode.EXCEL_MISSING_HEADER, reqHeader); // Cần mã lỗi phù hợp
            }
        }
    }

    // Helper này được giữ nguyên từ service của bạn
    private String getStringCellValue(Row row, Integer columnIndex, int rowNum, String fieldName, boolean isRequired) throws AppException {
        if (columnIndex == null) {
            if (isRequired) throw new AppException(ErrorCode.EXCEL_MISSING_HEADER, fieldName);
            return null; // Trả về null cho trường không bắt buộc
        }
        Cell cell = row.getCell(columnIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);

        if (cell == null || cell.getCellType() == CellType.BLANK) {
            if (isRequired) throw new AppException(ErrorCode.INVALID_COLUMN, fieldName); // Cần mã lỗi phù hợp
            return null; // Trả về null cho trường không bắt buộc
        }

        DataFormatter formatter = new DataFormatter();
        String cellValue = formatter.formatCellValue(cell).trim();

        if (isRequired && cellValue.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_COLUMN, fieldName); // Cần mã lỗi phù hợp
        }

        return cellValue.isEmpty() ? null : cellValue; // Trả về null nếu giá trị là rỗng sau khi trim
    }

    // Helper này được giữ nguyên từ service của bạn
    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }
}