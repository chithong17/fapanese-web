package com.ktnl.fapanese.controller;


import com.ktnl.fapanese.dto.request.CreateStudentRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.CreateStudentAccountResponse;
import com.ktnl.fapanese.dto.response.ExcelUploadResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.service.interfaces.IExcelUploadService;
import com.ktnl.fapanese.service.interfaces.IStudentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/students")
public class StudentController {
    IStudentService iStudentService;
    IExcelUploadService iExcelUploadService;

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @PostMapping
    public ApiResponse<CreateStudentAccountResponse> createStudentAccount(@RequestBody CreateStudentRequest resquest){
        CreateStudentAccountResponse response = iStudentService.createStudentAccount(resquest);

        return ApiResponse.<CreateStudentAccountResponse>builder()
                .result(response)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @GetMapping
    public ApiResponse<Page<UserResponse>> getAllStudent(
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(defaultValue = "id") String sortBy, // Mặc định sort theo ID
            @RequestParam(defaultValue = "asc") String sortDir
    ){
        var result = iStudentService.getAllStudent(campus, status, keyword, page, size, sortBy, sortDir);

        return ApiResponse.<Page<UserResponse>>builder()
                .result(result)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @GetMapping("/{email}")
    public ApiResponse<UserResponse> getStudentByEmail(@PathVariable String email) {
        UserResponse response = iStudentService.getStudentByEmail(email);
        return ApiResponse.<UserResponse>builder()
                .result(response)
                .message("Get student detail successfully")
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @PutMapping("/{email}")
    public ApiResponse<UserResponse> updateStudent(
            @PathVariable("email") String email,
            @RequestBody CreateStudentRequest updateRequest) {

        UserResponse response = iStudentService.updateStudent(email, updateRequest);
        return ApiResponse.<UserResponse>builder()
                .result(response)
                .message("Student updated successfully")
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{email}")
    public ApiResponse<Void> deleteStudent(@PathVariable("email") String email) {
        iStudentService.deleteStudent(email);
        return ApiResponse.<Void>builder()
                .message("Student deleted successfully")
                .build();
    }

    @PostMapping("/upload-excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ApiResponse<ExcelUploadResponse> uploadStudentsFromExcel(@RequestParam("file") MultipartFile file)
            throws IOException, AppException { // Khai báo throws để GlobalExceptionHandler bắt

        // --- Validation cơ bản ---
        if (file.isEmpty()) {
            // Ném exception thay vì return ResponseEntity trực tiếp
            throw new AppException(ErrorCode.FILE_REQUIRED);
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/vnd.ms-excel") && !contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))) {
            throw new AppException(ErrorCode.FILE_FORMAT_INVALID, "Định dạng file không hợp lệ (.xls, .xlsx)."); // Message cụ thể hơn
        }

        // --- Gọi ExcelUploadService ---
        // Không cần try-catch ở đây nữa
        ExcelUploadResponse result = iExcelUploadService.processStudentExcel(file);

        // --- Trả về kết quả thành công ---
        String message = String.format("Xử lý hoàn tất. Thành công: %d/%d.",
                result.getSuccessCount(), result.getTotalRowsProcessed());
        // Có thể thêm chi tiết lỗi vào message nếu muốn, nhưng để response gọn hơn thì chỉ cần result là đủ
        if (result.getFailureCount() > 0) {
            message += String.format(" Thất bại: %d.", result.getFailureCount());
        }

        return ApiResponse.<ExcelUploadResponse>builder()
                .result(result) // Trả về toàn bộ UploadResult
                .message(message) // Message tóm tắt
                .build(); // Mặc định code 1000, message success nếu không có lỗi
    }
}