package com.ktnl.fapanese.controller;


import com.ktnl.fapanese.dto.request.CreateLecturerRequest;
import com.ktnl.fapanese.dto.request.LecturerPagingRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.CreateLecturerAccountResponse;
import com.ktnl.fapanese.dto.response.ExcelUploadResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.service.interfaces.IExcelUploadService;
import com.ktnl.fapanese.service.interfaces.ILecturerService;
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
@RequestMapping("/api/lecturers")
public class LecturerController {
    ILecturerService iLecturerService;
    IExcelUploadService iExcelUploadService;

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping
    public ApiResponse<CreateLecturerAccountResponse> createLecturerAccount(@RequestBody CreateLecturerRequest resquest){
        CreateLecturerAccountResponse response = iLecturerService.createLecturerAccount(resquest);

        return ApiResponse.<CreateLecturerAccountResponse>builder()
                .result(response)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @GetMapping
    public ApiResponse<Page<UserResponse>> getAllLecturer( @ModelAttribute LecturerPagingRequest request){
        var result = iLecturerService.getAllLecturer(request);

        return ApiResponse.<Page<UserResponse>>builder()
                .result(result)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping("/{email}")
    public ApiResponse<UserResponse> getLecturerByEmail(@PathVariable String email) {
        UserResponse response = iLecturerService.getLecturerByEmail(email);
        return ApiResponse.<UserResponse>builder()
                .result(response)
                .message("Get student detail successfully")
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{email}")
    public ApiResponse<UserResponse> updateLecturer(
            @PathVariable("email") String email,
            @RequestBody CreateLecturerRequest updateRequest) {

        UserResponse response = iLecturerService.updateLecturer(email, updateRequest);
        return ApiResponse.<UserResponse>builder()
                .result(response)
                .message("Lecturer updated successfully")
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{email}")
    public ApiResponse<Void> deleteLecturer(@PathVariable("email") String email) {
        iLecturerService.deleteLecturer(email);
        return ApiResponse.<Void>builder()
                .message("Lecturer deleted successfully")
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/approve-teacher/{id}")
    public ApiResponse<UserResponse> approveTeacher(@PathVariable String id) {
        UserResponse updated = iLecturerService.updateStatusById(id, 3);
        return ApiResponse.<UserResponse>builder()
                .message("Phê duyệt giáo viên thành công")
                .result(updated)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/reject-teacher/{id}")
    public ApiResponse<UserResponse> rejectTeacher(@PathVariable String id) {
        UserResponse updated = iLecturerService.updateStatusById(id, -1);
        return ApiResponse.<UserResponse>builder()
                .message("Từ chối giáo viên thành công")
                .result(updated)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping("/pending-teachers")
    public ApiResponse<List<UserResponse>> getPendingTeachers() {
        List<UserResponse> teachers = iLecturerService.getPendingTeachers();
        return ApiResponse.<List<UserResponse>>builder()
                .message("Danh sách giáo viên chờ duyệt")
                .result(teachers)
                .build();
    }
}