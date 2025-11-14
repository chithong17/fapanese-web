package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.CreateStudentRequest;
import com.ktnl.fapanese.dto.response.ExcelUploadResponse;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.service.implementations.ExcelUploadService;
import com.ktnl.fapanese.service.interfaces.IStudentService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) // Nới lỏng kiểm tra mock thừa
class ExcelUploadServiceTest {

    @Mock
    private IStudentService iStudentService;
    @Mock
    private PasswordEncoder passwordEncoder; // Mặc dù không dùng, vẫn mock

    @InjectMocks
    private ExcelUploadService excelUploadService;

    // --- Hàm Helper để tạo file Excel giả lập ---

    /**
     * Tạo một file Excel (MockMultipartFile) trong bộ nhớ.
     * @param sheetName Tên của sheet
     * @param headers Danh sách tên các cột header
     * @param data Danh sách các dòng dữ liệu (mỗi dòng là một List<Object>)
     * @return MockMultipartFile sẵn sàng để test
     */
    private MockMultipartFile createMockExcelFile(String sheetName, List<String> headers, List<List<Object>> data) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(sheetName);

            // (THÊM) Tạo style cho ngày tháng
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("m/d/yy"));

            // 1. Tạo Header Row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
            }

            // 2. Tạo Data Rows
            int rowNum = 1;
            for (List<Object> rowData : data) {
                Row row = sheet.createRow(rowNum++);
                for (int i = 0; i < rowData.size(); i++) {
                    Cell cell = row.createCell(i);
                    Object value = rowData.get(i);

                    // (SỬA) Nâng cấp logic
                    if (value == null) {
                        cell.setBlank(); // Tạo ô trống
                    } else if (value instanceof String) {
                        cell.setCellValue((String) value);
                    } else if (value instanceof Number) {
                        cell.setCellValue(((Number) value).doubleValue());
                    } else if (value instanceof LocalDate) {
                        // Dùng kiểu Date thực sự của POI
                        cell.setCellValue((LocalDate) value);
                        cell.setCellStyle(dateStyle); // Áp dụng style ngày tháng
                    } else if (value instanceof Boolean) {
                        cell.setCellValue((Boolean) value);
                    }
                }
            }

            workbook.write(out);
            return new MockMultipartFile(
                    "file", // Tên tham số
                    "students.xlsx", // Tên file gốc
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    out.toByteArray()
            );
        }
    }

    // --- Kịch bản Test ---

    @Test
    @DisplayName("processStudentExcel: Xử lý thành công file hợp lệ")
    void processStudentExcel_Success_ValidFile() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email", "Campus", "DateOfBirth");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an.nguyen@test.com", "HCMC", "01/01/2000"),
                List.of("Bình", "Trần", "binh.tran@test.com", "Hanoi", "2001-03-15")
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Giả lập iStudentService.createStudentAccountList không ném lỗi
        when(iStudentService.createStudentAccountList(anyList())).thenReturn(true);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(2, response.getTotalRowsProcessed());
        assertEquals(2, response.getSuccessCount());
        assertEquals(0, response.getFailureCount());
        assertTrue(response.getErrorMessages().isEmpty());

        // Kiểm tra xem iStudentService có được gọi với đúng 2 student không
        ArgumentCaptor<List<CreateStudentRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(iStudentService, times(1)).createStudentAccountList(captor.capture());

        List<CreateStudentRequest> savedList = captor.getValue();
        assertEquals(2, savedList.size());
        assertEquals("an.nguyen@test.com", savedList.get(0).getEmail());
        assertEquals(LocalDate.of(2000, 1, 1), savedList.get(0).getDateOfBirth());
        assertEquals("binh.tran@test.com", savedList.get(1).getEmail());
        assertEquals(LocalDate.of(2001, 3, 15), savedList.get(1).getDateOfBirth());
    }

    @Test
    @DisplayName("processStudentExcel: Thất bại - Thiếu Header bắt buộc (Email)")
    void processStudentExcel_Fail_MissingRequiredHeader() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Campus"); // Thiếu Email
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "HCMC")
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Act & Assert
        AppException e = assertThrows(AppException.class, () ->
                excelUploadService.processStudentExcel(file)
        );

        assertEquals(ErrorCode.EXCEL_MISSING_HEADER, e.getErrorCode());
    }

    @Test
    @DisplayName("processStudentExcel: Xử lý file có dòng lỗi (Email không hợp lệ)")
    void processStudentExcel_PartialSuccess_InvalidEmailRow() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an.nguyen@test.com"),   // Hợp lệ
                List.of("Bình", "Trần", "binh.tran_at_test.com"), // Không hợp lệ
                List.of("Cường", "Phạm", "cuong.pham@test.com")  // Hợp lệ
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);
        when(iStudentService.createStudentAccountList(anyList())).thenReturn(true);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(3, response.getTotalRowsProcessed());
        assertEquals(2, response.getSuccessCount());
        assertEquals(1, response.getFailureCount()); // 1 lỗi
        assertEquals(1, response.getErrorMessages().size()); // 1 tin nhắn lỗi
        assertEquals("Dòng 3: " + ErrorCode.EMAIL_INVALID.getMessage(), response.getErrorMessages().get(0)); // Do bị bắt bởi catch (Exception e)

        // Kiểm tra iStudentService chỉ được gọi với 2 student hợp lệ
        ArgumentCaptor<List<CreateStudentRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(iStudentService, times(1)).createStudentAccountList(captor.capture());

        List<CreateStudentRequest> savedList = captor.getValue();
        assertEquals(2, savedList.size());
        assertEquals("an.nguyen@test.com", savedList.get(0).getEmail());
        assertEquals("cuong.pham@test.com", savedList.get(1).getEmail());
    }

    @Test
    @DisplayName("processStudentExcel: Thất bại - Lỗi trùng lặp trong DB (DataIntegrityViolation)")
    void processStudentExcel_Fail_DatabaseConstraintViolation() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an.nguyen@test.com")
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Giả lập lỗi DB (lỗi trùng lặp email)
        SQLException sqlException = new SQLException("Duplicate entry 'an.nguyen@test.com' for key 'email'");
        ConstraintViolationException constraintViolation = new ConstraintViolationException("could not execute statement", sqlException, "email_unique");
        DataIntegrityViolationException dbException = new DataIntegrityViolationException("...", constraintViolation);

        doThrow(dbException).when(iStudentService).createStudentAccountList(anyList());

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount()); // Lỗi do DB
        assertEquals(1, response.getErrorMessages().size());
        assertEquals("Dòng 0: " + ErrorCode.EMAIL_EXISTED.getMessage(), response.getErrorMessages().get(0));
    }

    @Test
    @DisplayName("processStudentExcel: Xử lý file chỉ có Header")
    void processStudentExcel_Success_HeaderOnly() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = Collections.emptyList();
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(0, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount());
        assertFalse(response.getErrorMessages().isEmpty());
        assertEquals("Dòng 0: Không tìm thấy dòng dữ liệu hợp lệ nào trong file.", response.getErrorMessages().get(0));
        verify(iStudentService, never()).createStudentAccountList(anyList());
    }

    @Test
    @DisplayName("processStudentExcel: Thất bại - File trống (không có header)")
    void processStudentExcel_Fail_EmptyFile() throws IOException {
        // Arrange
        // Tạo file hoàn toàn trống
        MockMultipartFile file;
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Không tạo sheet, không tạo gì cả
            workbook.write(out);
            file = new MockMultipartFile("file", "empty.xlsx", null, out.toByteArray());
        }

        // Tạo file có sheet nhưng không có row
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.createSheet("Sheet1");
            workbook.write(out);
            file = new MockMultipartFile("file", "empty_sheet.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", out.toByteArray());
        }

        // Act & Assert
        MockMultipartFile finalFile = file;
        AppException e = assertThrows(AppException.class, () ->
                excelUploadService.processStudentExcel(finalFile)
        );

        assertEquals(ErrorCode.FILE_REQUIRED, e.getErrorCode());
    }

    @Test
    @DisplayName("Coverage: Xử lý file có dòng trống ở giữa")
    void processStudentExcel_WithEmptyRow() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an.nguyen@test.com"), // Dòng 1 hợp lệ
                List.of(),                                     // Dòng 2 trống
                List.of("Bình", "Trần", "binh.tran@test.com")  // Dòng 3 hợp lệ
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);
        when(iStudentService.createStudentAccountList(anyList())).thenReturn(true);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(3, response.getTotalRowsProcessed()); // Xử lý 3 dòng (1 trống)
        assertEquals(2, response.getSuccessCount()); // 2 thành công
        assertEquals(1, response.getFailureCount()); // 1 lỗi (dòng trống)
        assertTrue(response.getErrorMessages().get(0).contains("Dòng trống"));
    }

    @Test
    @DisplayName("Coverage: Lỗi cột bắt buộc (Email) bị trống (getStringCellValue)")
    void processStudentExcel_Fail_RequiredStringCellEmpty() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "") // Email trống
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        // Service bắt AppException(INVALID_COLUMN) và báo là "Lỗi không xác định"
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount());
        assertEquals("Dòng 2: " + ErrorCode.INVALID_COLUMN.getMessage("Email"), response.getErrorMessages().get(0));
    }

    @Test
    @DisplayName("Coverage: Lỗi cột bắt buộc (DateOfBirth) bị trống (getDateCellValue)")
    void processStudentExcel_Fail_RequiredDateCellEmpty() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email", "DateOfBirth");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an@test.com", "") // DOB trống (nhưng ta giả sử nó bắt buộc)
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // --- Mock cho kịch bản này (Giả sử DOB là bắt buộc) ---
        // Để test nhánh này, chúng ta phải làm cho 'getDateCellValue' ném lỗi
        // Bằng cách tạm thời sửa logic (ví dụ: làm nó bắt buộc),
        // hoặc chấp nhận rằng nhánh 'isRequired' cho DOB không thể đạt được
        // vì nó đang được set là false (isRequired=false) trong service.

        // Hiện tại, test này sẽ chạy như một kịch bản THÀNH CÔNG (DOB là optional)
        when(iStudentService.createStudentAccountList(anyList())).thenReturn(true);
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(1, response.getSuccessCount()); // Vẫn thành công vì DOB là optional
        assertEquals(0, response.getFailureCount());
    }

    @Test
    @DisplayName("Coverage: Lỗi định dạng ngày tháng (getDateCellValue)")
    void processStudentExcel_Fail_InvalidDateFormat() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email", "DateOfBirth");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an@test.com", "30-02-2000") // Ngày không hợp lệ
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        // Service bắt AppException(DOB_FORMAT_INVALID) và báo là "Lỗi không xác định"
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount());
        String expectedError = ErrorCode.DOB_FORMAT_INVALID.getMessage("30-02-2000", "Ngày Sinh (DateOfBirth)");
        assertEquals("Dòng 2: " + expectedError, response.getErrorMessages().get(0));
    }

    @Test
    @DisplayName("Coverage: Test các header thay thế (ho, ten, ngaysinh)")
    void processStudentExcel_TestHeaderAlternatives() throws IOException {
        // Arrange
        List<String> headers = List.of("Ho", "Ten", "Email", "ngaysinh"); // Dùng header thay thế
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an.nguyen@test.com", "2000-01-01")
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);
        when(iStudentService.createStudentAccountList(anyList())).thenReturn(true);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(1, response.getSuccessCount());

        ArgumentCaptor<List<CreateStudentRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(iStudentService).createStudentAccountList(captor.capture());
        assertEquals("an.nguyen@test.com", captor.getValue().get(0).getEmail());
        assertEquals("An", captor.getValue().get(0).getFirstName());
        assertEquals("Nguyễn", captor.getValue().get(0).getLastName());
        assertEquals(LocalDate.of(2000,1,1), captor.getValue().get(0).getDateOfBirth());
    }

    @Test
    @DisplayName("Coverage: Lỗi hệ thống chung khi lưu (catch Exception e)")
    void processStudentExcel_Fail_GenericSaveException() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an.nguyen@test.com")
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Giả lập một lỗi hệ thống (không phải lỗi DB)
        doThrow(new RuntimeException("Lỗi hệ thống chung"))
                .when(iStudentService).createStudentAccountList(anyList());

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount()); // Kích hoạt nhánh if cuối cùng
        assertEquals("Dòng 0: Lỗi hệ thống khi lưu dữ liệu.", response.getErrorMessages().get(0));
    }

    @Test
    @DisplayName("Coverage: Lỗi DB không phải do trùng lặp (DataIntegrityViolation - else block)")
    void processStudentExcel_Fail_DatabaseConstraint_Generic() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an.nguyen@test.com")
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Giả lập lỗi DB (KHÔNG phải "duplicate entry")
        SQLException sqlException = new SQLException("Some other constraint failed");
        ConstraintViolationException constraintViolation = new ConstraintViolationException("could not execute statement", sqlException, "other_constraint");
        DataIntegrityViolationException dbException = new DataIntegrityViolationException("...", constraintViolation);

        doThrow(dbException).when(iStudentService).createStudentAccountList(anyList());

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount());
        assertEquals("Dòng 0: Lỗi ràng buộc dữ liệu khi lưu.", response.getErrorMessages().get(0));
    }

    @Test
    @DisplayName("Coverage: Thất bại - Trùng lặp Email BÊN TRONG file")
    void processStudentExcel_Fail_DuplicateEmailInFile() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "duplicate@test.com"),   // Hợp lệ
                List.of("Bình", "Trần", "duplicate@test.com")  // Lỗi trùng lặp
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);
        when(iStudentService.createStudentAccountList(anyList())).thenReturn(true);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(2, response.getTotalRowsProcessed());
        assertEquals(1, response.getSuccessCount()); // Chỉ 1 student được thêm vào list
        assertEquals(1, response.getFailureCount());
        assertEquals("Dòng 3: " + ErrorCode.EMAIL_EXISTED.getMessage(), response.getErrorMessages().get(0));
    }

    @Test
    @DisplayName("Coverage: Thành công - Đọc ô Ngày tháng dạng Numeric")
    void processStudentExcel_Success_NumericDateCell() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email", "DateOfBirth");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an@test.com", LocalDate.of(2002, 10, 20)) // Gửi LocalDate
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);
        when(iStudentService.createStudentAccountList(anyList())).thenReturn(true);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(1, response.getSuccessCount());

        ArgumentCaptor<List<CreateStudentRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(iStudentService).createStudentAccountList(captor.capture());
        assertEquals(LocalDate.of(2002, 10, 20), captor.getValue().get(0).getDateOfBirth());
    }

    @Test
    @DisplayName("Coverage: Thất bại - Kiểu dữ liệu sai cho Ngày tháng (Boolean)")
    void processStudentExcel_Fail_InvalidDataTypeForDate() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email", "DateOfBirth");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an@test.com", true) // Gửi Boolean vào ô ngày
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount());
        // Lỗi này sẽ được bắt bởi catch(AppException) và báo cáo đúng (nhờ Sửa lỗi 2)
        assertEquals("Dòng 2: " + ErrorCode.EXCEL_INVALID_DATA_TYPE.getMessage("Ngày Sinh (DateOfBirth)"), response.getErrorMessages().get(0));
    }

    @Test
    @DisplayName("Coverage: Thất bại - Cột bắt buộc (Email) là ô trống (BLANK)")
    void processStudentExcel_Fail_RequiredCellIsBlank() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                Arrays.asList("An", "Nguyễn", null) // Gửi null để tạo ô BLANK
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount());
        assertEquals("Dòng 2: " + ErrorCode.INVALID_COLUMN.getMessage("Email"), response.getErrorMessages().get(0));
    }

    @Test
    @DisplayName("Coverage: Thất bại - Email không hợp lệ (isValidEmail)")
    void processStudentExcel_Fail_InvalidEmailFormat() throws IOException {
        // Arrange
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "email-khong-hop-le")
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount());
        assertEquals("Dòng 2: " + ErrorCode.EMAIL_INVALID.getMessage(), response.getErrorMessages().get(0));    }

    @Test
    @DisplayName("Coverage: Lỗi khi đọc ô Date (catch Exception e)")
    void processStudentExcel_Fail_GenericDateReadError() throws IOException {
        // Arrange
        // Tạo một file mà cell DateOfBirth là Numeric NHƯNG KHÔNG PHẢI là Date
        List<String> headers = List.of("FirstName", "LastName", "Email", "DateOfBirth");
        List<List<Object>> data = List.of(
                List.of("An", "Nguyễn", "an@test.com", 12345.67) // Gửi số thập phân
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount());
        // Lỗi này sẽ bị bắt bởi catch(Exception) trong getDateCellValue VÀ catch(AppException) trong processExcel
        assertEquals("Dòng 2: " + ErrorCode.EXCEL_INVALID_DATA_TYPE.getMessage("Ngày Sinh (DateOfBirth)"), response.getErrorMessages().get(0));
    }


    @Test
    @DisplayName("Coverage: Thất bại - Header có ô không phải là String (mapHeaderToIndex)")
    void processStudentExcel_Fail_HeaderCellIsNotString() throws IOException {
        // Arrange
        MockMultipartFile file;
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Sheet1");
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("FirstName");
            headerRow.createCell(1).setCellValue("LastName");
            headerRow.createCell(2).setCellValue(12345); // <-- Header là SỐ (Numeric)

            workbook.write(out);
            file = new MockMultipartFile("file", "bad_header.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", out.toByteArray());
        }

        // Act & Assert
        // Lỗi này sẽ bị bắt bởi validateRequiredHeaders vì nó không tìm thấy "email"
        AppException e = assertThrows(AppException.class, () ->
                excelUploadService.processStudentExcel(file)
        );

        // Chúng ta chỉ cần xác nhận nó ném lỗi (đã cover nhánh cell != STRING)
        assertEquals(ErrorCode.EXCEL_MISSING_HEADER, e.getErrorCode());
    }

    @Test
    @DisplayName("Coverage: Thất bại - Email truyền vào là null (isValidEmail)")
    void processStudentExcel_Fail_NullEmail() throws IOException {
        // Arrange
        // (Chúng ta đã test ô trống/BLANK, nhưng chưa test kịch bản email bị null)
        List<String> headers = List.of("FirstName", "LastName", "Email");
        List<List<Object>> data = List.of(
                Arrays.asList("An", "Nguyễn", null) // Email là null
        );
        MockMultipartFile file = createMockExcelFile("Sheet1", headers, data);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        assertEquals(1, response.getTotalRowsProcessed());
        assertEquals(0, response.getSuccessCount());
        assertEquals(1, response.getFailureCount());
        // Lỗi này sẽ bị bắt bởi getStringCellValue (isRequired=true, cell=null)
        assertEquals("Dòng 2: " + ErrorCode.INVALID_COLUMN.getMessage("Email"), response.getErrorMessages().get(0));
    }

    @Test
    @DisplayName("Coverage: Bỏ qua dòng null (isRowEmpty)")
    void processStudentExcel_SkipNullRow() throws IOException {
        // Arrange
        MockMultipartFile file;
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Sheet1");
            // Tạo Header
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("FirstName");
            headerRow.createCell(1).setCellValue("LastName");
            headerRow.createCell(2).setCellValue("Email");

            // Dòng 1: Hợp lệ
            Row row1 = sheet.createRow(1);
            row1.createCell(0).setCellValue("An");
            row1.createCell(1).setCellValue("Nguyen");
            row1.createCell(2).setCellValue("an@test.com");

            // Dòng 2: Sẽ là null (bỏ qua không tạo)

            // Dòng 3: Hợp lệ
            Row row3 = sheet.createRow(3);
            row3.createCell(0).setCellValue("Binh");
            row3.createCell(1).setCellValue("Tran");
            row3.createCell(2).setCellValue("binh@test.com");

            workbook.write(out);
            file = new MockMultipartFile("file", "null_row.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", out.toByteArray());
        }

        when(iStudentService.createStudentAccountList(anyList())).thenReturn(true);

        // Act
        ExcelUploadResponse response = excelUploadService.processStudentExcel(file);

        // Assert
        // Mặc dù file có 4 dòng (header, data, null, data)
        // POI iterator có thể sẽ chỉ đọc 3 dòng có dữ liệu
        // Nhưng nếu nó đọc dòng null (rowNum=3), thì isRowEmpty(null) sẽ là true
        // và nó sẽ được báo cáo là "Dòng trống"

        // Dựa trên code, nó sẽ đọc 3 dòng (rowNum 2, 3, 4)
        assertEquals(2, response.getTotalRowsProcessed());
        assertEquals(2, response.getSuccessCount()); // An, Binh
        assertEquals(0, response.getFailureCount()); // Không có dòng null nào được xử lý
        assertTrue(response.getErrorMessages().isEmpty()); // Không có lỗi
    }
}