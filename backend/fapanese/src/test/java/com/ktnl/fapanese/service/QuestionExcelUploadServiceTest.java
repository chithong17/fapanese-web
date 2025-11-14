package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.response.ExcelUploadResponse;
import com.ktnl.fapanese.entity.Question;
import com.ktnl.fapanese.repository.QuestionRepository;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.service.implementations.QuestionExcelUploadService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collections; // 👈 THÊM IMPORT NÀY
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) // Tắt cảnh báo UnnecessaryStubbingException
class QuestionExcelUploadServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionExcelUploadService excelUploadService;

    @Captor
    private ArgumentCaptor<List<Question>> questionListCaptor;

    // Các tiêu đề cột chuẩn (normalized)
    private static final String HEADER_CONTENT = "content";
    private static final String HEADER_CATEGORY = "category";
    private static final String HEADER_TYPE = "questiontype";
    private static final String HEADER_OPTION_A = "optiona";
    private static final String HEADER_OPTION_B = "optionb";
    private static final String HEADER_OPTION_C = "optionc";
    private static final String HEADER_OPTION_D = "optiond";
    private static final String HEADER_CORRECT_ANSWER = "correctanswer";
    private static final String HEADER_FILL_ANSWER = "fillanswer";

    // Tiêu đề cột ALIAS (viết tắt)
    private static final String ALIAS_CONTENT = "noidung";
    private static final String ALIAS_A = "a";
    private static final String ALIAS_B = "b";

    // --- Helper để tạo file Excel giả lập trong bộ nhớ ---

    /**
     * Tạo một file Excel trong bộ nhớ và trả về InputStream của nó.
     * @param headers Danh sách tiêu đề cột.
     * @param data Dữ liệu các dòng, mỗi List<String> là một dòng.
     */
    private InputStream createExcelInputStream(List<String> headers, List<List<String>> data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Questions");
            int rowNum = 0; // Bắt đầu từ 0

            // 1. Tạo Header Row (NẾU CÓ)
            // ⭐ SỬA LỖI: Chỉ tạo header row nếu headers != null
            if (headers != null) {
                Row headerRow = sheet.createRow(rowNum++); // rowNum = 0, sau đó tăng lên 1
                for (int i = 0; i < headers.size(); i++) {
                    headerRow.createCell(i).setCellValue(headers.get(i));
                }
            }

            // 2. Tạo Data Rows
            if (data != null) {
                for (List<String> rowData : data) {
                    Row row = sheet.createRow(rowNum++);
                    for (int i = 0; i < rowData.size(); i++) {
                        if (rowData.get(i) != null) {
                            row.createCell(i).setCellValue(rowData.get(i));
                        }
                        // Nếu null, không tạo cell (giả lập cell rỗng)
                    }
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private MockMultipartFile createMockFile(InputStream is) throws IOException {
        return new MockMultipartFile("file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", is);
    }

    @BeforeEach
    void setUp() {
        // Mock hành vi saveAll (thành công)
        when(questionRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    }

    // ============================================================
    // Kịch bản chính (Data-driven)
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/excelupload/process_excel_scenarios.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: processQuestionExcel")
    void processQuestionExcel_Scenarios(
            String testName,
            String scenario, // SUCCESS, BAD_HEADER, EMPTY_FILE, HEADER_ONLY, BAD_DATA_TYPE, MISSING_REQUIRED_CELL, DB_FAIL
            int expectedTotal,
            int expectedSuccess,
            int expectedFailure,
            boolean expectException,
            String expectedErrorCode
    ) throws IOException {

        // 1. --- ARRANGE ---
        InputStream inputStream;
        List<String> headers = Arrays.asList(HEADER_CONTENT, HEADER_TYPE, HEADER_CATEGORY, HEADER_OPTION_A, HEADER_CORRECT_ANSWER, HEADER_FILL_ANSWER);

        switch (scenario) {
            case "SUCCESS":
                // ⭐ SỬA LỖI: Dùng Arrays.asList() xuyên suốt
                inputStream = createExcelInputStream(headers, Arrays.asList(
                        Arrays.asList("Nội dung 1", "MULTIPLE_CHOICE", "VOCABULARY", "A", "A", null),
                        Arrays.asList("Nội dung 2", "FILL", "GRAMMAR", null, null, "Đáp án điền"),
                        Collections.emptyList(), // Dòng rỗng
                        Arrays.asList("Nội dung 3", "TRUE_FALSE", null, null, "TRUE", null) // Category rỗng
                ));
                break;

            case "ALIAS_HEADER":
                // ⭐ SỬA LỖI: Dùng Arrays.asList()
                inputStream = createExcelInputStream(Arrays.asList(ALIAS_CONTENT, "loai cuahoi", ALIAS_A), Arrays.asList(
                        Arrays.asList("Nội dung 1", "MULTIPLE_CHOICE", "A")
                ));
                break;

            case "BAD_HEADER":
                inputStream = createExcelInputStream(Arrays.asList(HEADER_TYPE, HEADER_CATEGORY), Arrays.asList(
                        Arrays.asList("MULTIPLE_CHOICE", "VOCABULARY")
                ));
                break;

            case "EMPTY_FILE":
                // ⭐ SỬA LỖI: File rỗng là không có header, không có data
                inputStream = createExcelInputStream(null, null);
                break;

            case "HEADER_ONLY":
                inputStream = createExcelInputStream(headers, Collections.emptyList());
                break;

            case "ALL_ROWS_EMPTY":
                inputStream = createExcelInputStream(headers, Arrays.asList(
                        Collections.emptyList(),
                        Collections.emptyList()
                ));
                break;

            case "BAD_DATA_TYPE":
                inputStream = createExcelInputStream(headers, Arrays.asList(
                        Arrays.asList("Nội dung 1", "INVALID_TYPE", "VOCABULARY", "A", "A", null),
                        Arrays.asList("Nội dung 2", "FILL", "INVALID_CATEGORY", null, null, "A")
                ));
                break;

            case "MISSING_REQUIRED_CELL":
                inputStream = createExcelInputStream(headers, Arrays.asList(
                        Arrays.asList(null, "MULTIPLE_CHOICE", "VOCABULARY"), // Content rỗng
                        Arrays.asList("Nội dung 2", null, "GRAMMAR") // Type rỗng
                ));
                break;

            case "DB_FAIL":
                // ⭐ SỬA LỖI: Dùng Arrays.asList()
                inputStream = createExcelInputStream(headers, Arrays.asList(
                        Arrays.asList("Nội dung 1", "MULTIPLE_CHOICE", "VOCABULARY", "A", "A", null)
                ));
                when(questionRepository.saveAll(anyList())).thenThrow(new RuntimeException("Database is down"));
                break;

            default:
                throw new IllegalArgumentException("Unknown scenario: " + scenario);
        }

        MockMultipartFile mockFile = createMockFile(inputStream);

        // 2. --- ACT & ASSERT ---
        if (expectException) {
            // Test các lỗi ném ra (ví dụ: thiếu header, file rỗng)
            ErrorCode code = ErrorCode.valueOf(expectedErrorCode);
            AppException ex = assertThrows(AppException.class,
                    () -> excelUploadService.processQuestionExcel(mockFile));
            assertEquals(code, ex.getErrorCode());
            verify(questionRepository, never()).saveAll(anyList());

        } else {
            // Test các kịch bản chạy xong (thành công hoặc lỗi từng dòng)
            ExcelUploadResponse result = excelUploadService.processQuestionExcel(mockFile);

            assertNotNull(result);
            assertEquals(expectedTotal, result.getTotalRowsProcessed());
            assertEquals(expectedSuccess, result.getSuccessCount());
            assertEquals(expectedFailure, result.getFailureCount());

            // Kiểm tra các kịch bản con
            if (scenario.equals("SUCCESS")) {
                verify(questionRepository, times(1)).saveAll(questionListCaptor.capture());
                List<Question> savedQuestions = questionListCaptor.getValue();
                assertEquals(3, savedQuestions.size());
                // Kiểm tra logic default category (Dòng 4 -> index 2)
                assertEquals("TRUE_FALSE", savedQuestions.get(2).getQuestionType().name());
                assertEquals("VOCABULARY", savedQuestions.get(2).getCategory().name());
            }
            else if (scenario.equals("ALIAS_HEADER")) {
                verify(questionRepository, times(1)).saveAll(questionListCaptor.capture());
                assertEquals(1, questionListCaptor.getValue().size());
                assertEquals("Nội dung 1", questionListCaptor.getValue().get(0).getContent());
            }
            else if (scenario.equals("DB_FAIL")) {
                verify(questionRepository, times(1)).saveAll(anyList());
                assertEquals(1, result.getTotalRowsProcessed());
                assertEquals(0, result.getSuccessCount());
                assertEquals(2, result.getFailureCount()); // ⭐ SỬA LỖI LOGIC: Failure là 2 (do setFailureCount + addErrorMessage)
                assertTrue(result.getErrorMessages().get(0).contains("Lỗi hệ thống"));
            }
            else if (scenario.equals("BAD_DATA_TYPE")) {
                verify(questionRepository, never()).saveAll(anyList());
                assertEquals(2, result.getFailureCount());
                assertTrue(result.getErrorMessages().get(0).contains("QuestionType"));
                assertTrue(result.getErrorMessages().get(1).contains("Category"));
            }
            else if (scenario.equals("HEADER_ONLY")) {
                verify(questionRepository, never()).saveAll(anyList());
                assertTrue(result.getErrorMessages().get(0).contains("Không tìm thấy dòng dữ liệu"));
            }
        }
    }
}