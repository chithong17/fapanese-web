package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.request.CreateStudentRequest;
import com.ktnl.fapanese.dto.response.ExcelUploadResponse;
import com.ktnl.fapanese.entity.Student;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.repository.StudentRepository;
import com.ktnl.fapanese.service.interfaces.IExcelUploadService;
import com.ktnl.fapanese.service.interfaces.IStudentService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExcelUploadService implements IExcelUploadService {
    StudentRepository studentRepository;
    IStudentService iStudentService;
    PasswordEncoder passwordEncoder; // Inject if setting default password

    // Define expected headers (lowercase, trimmed)
    private static final String HEADER_FIRSTNAME = "firstname";
    private static final String HEADER_LASTNAME = "lastname";
    private static final String HEADER_EMAIL = "email";
    private static final String HEADER_CAMPUS = "campus";
    private static final String HEADER_DOB = "dateofbirth"; // Or other variations like 'dob', 'ngaysinh'

    // Define date formatters to try parsing string dates
    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ISO_LOCAL_DATE // YYYY-MM-DD
            // Add more formats if needed
    );

    @Override
    @Transactional // Ensure atomicity for the database save operation
    public ExcelUploadResponse processStudentExcel(MultipartFile file) throws IOException, AppException {
        ExcelUploadResponse result = new ExcelUploadResponse();
        List<CreateStudentRequest> studentsToSave = new ArrayList<>();
        Set<String> emailsInFile = new HashSet<>(); // Track emails within the file for duplicates

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            // 1. Validate Header Row
            if (!rowIterator.hasNext()) {
                throw new AppException(ErrorCode.FILE_REQUIRED); // Use specific code
            }
            Row headerRow = rowIterator.next();
            Map<String, Integer> headerMap = mapHeaderToIndex(headerRow);
            validateRequiredHeaders(headerMap);

            // 2. Process Data Rows
            int rowNum = 1; // Start after header
            while (rowIterator.hasNext()) {
                rowNum++;
                result.setTotalRowsProcessed(result.getTotalRowsProcessed() + 1); // Increment total rows attempt
                Row currentRow = rowIterator.next();

                if (isRowEmpty(currentRow)) {
                    log.debug("Skipping empty row {}", rowNum);
                    result.addErrorMessage(rowNum, "Dòng trống, bỏ qua."); // Optionally report empty rows
                    continue;
                }

                String email = null;
                try {
                    CreateStudentRequest student = new CreateStudentRequest();
                    student.setFirstName(getStringCellValue(currentRow, headerMap.get(HEADER_FIRSTNAME), rowNum, "Họ (FirstName)", true));
                    student.setLastName(getStringCellValue(currentRow, headerMap.get(HEADER_LASTNAME), rowNum, "Tên (LastName)", true));
                    email = getStringCellValue(currentRow, headerMap.get(HEADER_EMAIL), rowNum, "Email", true);
                    student.setCampus(getStringCellValue(currentRow, headerMap.get(HEADER_CAMPUS), rowNum, "Campus", false));
                    student.setDateOfBirth(getDateCellValue(currentRow, headerMap.get(HEADER_DOB), rowNum, "Ngày Sinh (DateOfBirth)", false));

                    // Basic Validations
                    if (!isValidEmail(email)) {
                        throw new AppException(ErrorCode.EMAIL_INVALID);
                    }
                    student.setEmail(email.toLowerCase().trim()); // Normalize email


                    // Check for duplicate email within the file
                    if (!emailsInFile.add(student.getEmail())) {
                        throw new AppException(ErrorCode.EMAIL_EXISTED);
                    }

                    // Add to save list if valid so far
                    studentsToSave.add(student);

                } catch (AppException e) {
                    log.warn("Validation error processing row {}: {}", rowNum, e.getMessage());
                    result.addErrorMessage(rowNum, e.getErrorCode().getMessage(e.getArgs()));
                } catch (Exception e) {
                    log.error("Unexpected system error processing row {}", rowNum, e);
                    result.addErrorMessage(rowNum, "Lỗi hệ thống không xác định tại dòng này.");
                }
            } // End row iteration

            // 3. Batch Save to Database
            if (!studentsToSave.isEmpty()) {
                try {
                    // saveAllAndFlush triggers constraints earlier within the transaction
                    iStudentService.createStudentAccountList(studentsToSave);
                    result.setSuccessCount(studentsToSave.size());
                    log.info("Successfully saved {} students from Excel.", studentsToSave.size());

                } catch (DataIntegrityViolationException e) {
                    // Handle unique constraint violations (e.g., email already exists in DB)
                    log.warn("Data integrity violation during batch student save: {}", e.getMessage());
                    result.setErrorMessages(new ArrayList<>()); // Clear previous row errors
                   // result.setFailureCount(result.getTotalRowsProcessed()); // All rows in this batch failed
                    result.setSuccessCount(0);

                    // Provide a more specific error message if possible
                    String rootMsg = e.getMostSpecificCause().getMessage().toLowerCase();
                    if (rootMsg.contains("duplicate entry") && rootMsg.contains("email")) {
                        result.addErrorMessage(0, ErrorCode.EMAIL_EXISTED.getMessage()); // Use generic message from ErrorCode
                    } else {
                        result.addErrorMessage(0, "Lỗi ràng buộc dữ liệu khi lưu.");
                    }
                    // No need to throw here, return the ExcelUploadResponse with errors
                } catch (Exception e) {
                    log.error("Error during batch saving students", e);
                    result.setErrorMessages(new ArrayList<>()); // Clear previous errors
                    //result.setFailureCount(result.getTotalRowsProcessed());
                    result.setSuccessCount(0);
                    result.addErrorMessage(0, "Lỗi hệ thống khi lưu dữ liệu.");
                    // No need to throw here
                }
            } else if (result.getFailureCount() == 0) {
                // Case where file had only header or only empty/invalid rows, but no actual data processed
                if (result.getTotalRowsProcessed() == 0) {
                    result.addErrorMessage(0, "Không tìm thấy dòng dữ liệu hợp lệ nào trong file.");
                }
                // If totalRowsProcessed > 0 but studentsToSave is empty, failures were already counted.
            }

        } // End try-with-resources

        // Ensure failure count reflects total rows if saving failed entirely
        if (result.getSuccessCount() == 0 && !studentsToSave.isEmpty() && result.getErrorMessages().stream().anyMatch(m -> m.contains("Lỗi lưu dữ liệu"))) {
            result.setFailureCount(result.getTotalRowsProcessed());
        }


        log.info("Excel processing finished. Total: {}, Success: {}, Failure: {}",
                result.getTotalRowsProcessed(), result.getSuccessCount(), result.getFailureCount());
        return result;
    }

    // --- Helper Methods ---

    private Map<String, Integer> mapHeaderToIndex(Row headerRow) {
        Map<String, Integer> headerMap = new HashMap<>();
        if (headerRow == null) return headerMap;
        for (Cell cell : headerRow) {
            if (cell != null && cell.getCellType() == CellType.STRING) {
                String headerText = cell.getStringCellValue().toLowerCase().trim().replaceAll("\\s+", ""); // Normalize header
                headerMap.put(headerText, cell.getColumnIndex());
                // Allow mapping alternative header names
                if (headerText.equals("dob") || headerText.equals("ngaysinh")) {
                    headerMap.putIfAbsent(HEADER_DOB, cell.getColumnIndex());
                }
                if (headerText.equals("ho")) {
                    headerMap.putIfAbsent(HEADER_FIRSTNAME, cell.getColumnIndex());
                }
                if (headerText.equals("ten")) {
                    headerMap.putIfAbsent(HEADER_LASTNAME, cell.getColumnIndex());
                }
            }
        }
        return headerMap;
    }

    private void validateRequiredHeaders(Map<String, Integer> headerMap) throws AppException {
        List<String> required = List.of(HEADER_FIRSTNAME, HEADER_LASTNAME, HEADER_EMAIL);
        for (String reqHeader : required) {
            if (!headerMap.containsKey(reqHeader)) {
                log.warn("Missing required header: {}", reqHeader);
                throw new AppException(ErrorCode.EXCEL_MISSING_HEADER, reqHeader);
            }
        }
    }

    private String getStringCellValue(Row row, Integer columnIndex, int rowNum, String fieldName, boolean isRequired) throws AppException {
        if (columnIndex == null) {
            if (isRequired) throw new AppException(ErrorCode.EXCEL_MISSING_HEADER, fieldName);
            log.info(String.format("Thiếu cột '%s'.", fieldName));
            return ""; // Default to empty string for optional fields
        }
        Cell cell = row.getCell(columnIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);

        if (cell == null || cell.getCellType() == CellType.BLANK) {
            if (isRequired) throw new AppException(ErrorCode.INVALID_COLUMN, fieldName);
            log.info(String.format("Cột '%s' không được để trống.", fieldName));
            return "";
        }

        DataFormatter formatter = new DataFormatter(); // Use DataFormatter for consistent string conversion
        String cellValue = formatter.formatCellValue(cell).trim();

        if (isRequired && cellValue.isEmpty()) {
            if (isRequired) throw new AppException(ErrorCode.INVALID_COLUMN, fieldName);
            log.info(String.format("Cột '%s' không được để trống.", fieldName));
        }

        return cellValue;
    }

    private LocalDate getDateCellValue(Row row, Integer columnIndex, int rowNum, String fieldName, boolean isRequired) throws AppException {
        if (columnIndex == null) {
            if (isRequired) throw new AppException(ErrorCode.EXCEL_MISSING_HEADER, fieldName);
            log.info(String.format("Thiếu cột '%s'.", fieldName));
            return null;
        }
        Cell cell = row.getCell(columnIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);

        if (cell == null || cell.getCellType() == CellType.BLANK) {
            if (isRequired) throw new AppException(ErrorCode.INVALID_COLUMN, fieldName);
            log.info(String.format("Cột '%s' không được để trống.", fieldName));
            return null;
        }

        try {
            if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                Date date = cell.getDateCellValue();
                return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            } else if (cell.getCellType() == CellType.STRING) {
                String dateString = cell.getStringCellValue().trim();
                if (dateString.isEmpty()) { // Handle empty string case for optional date
                    if (isRequired) throw new AppException(ErrorCode.INVALID_COLUMN, fieldName);
                    log.info(String.format("Cột '%s' không được để trống.", fieldName));
                    return null;
                }
                for (DateTimeFormatter formatter : DATE_FORMATTERS) {
                    try {
                        return LocalDate.parse(dateString, formatter);
                    } catch (DateTimeParseException ignored) {}
                }
                throw new AppException(ErrorCode.DOB_FORMAT_INVALID, dateString, fieldName);

            } else {
                // Try DataFormatter for other types just in case
                DataFormatter dataFormatter = new DataFormatter();
                String formattedValue = dataFormatter.formatCellValue(cell).trim();
                if (formattedValue.isEmpty()) {
                    if (isRequired) throw new AppException(ErrorCode.INVALID_COLUMN, fieldName);
                    log.info(String.format("Cột '%s' không được để trống.", fieldName));
                    return null;
                }
                for (DateTimeFormatter formatter : DATE_FORMATTERS) {
                    try {
                        return LocalDate.parse(formattedValue, formatter);
                    } catch (DateTimeParseException ignored) {}
                }
                log.info(String.format("Kiểu dữ liệu ở cột '%s' không phải ngày tháng hợp lệ.", fieldName));
                throw new AppException(ErrorCode.EXCEL_INVALID_DATA_TYPE, fieldName);
            }
        } catch (AppException ae) {
            throw ae; // Re-throw specific exceptions
        }
        catch (Exception e) {
            log.warn("Error parsing date cell at row {}, col {}: {}", rowNum, columnIndex, e.getMessage());
            log.info(String.format("Lỗi khi đọc ngày tháng ở cột '%s'.", fieldName));
            throw new AppException(ErrorCode.EXCEL_READ_ERROR, fieldName);

        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    // Basic email validation regex
    private boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) return false;
        // Simple regex, consider using a more robust library if needed
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return email.matches(emailRegex);
    }
}
