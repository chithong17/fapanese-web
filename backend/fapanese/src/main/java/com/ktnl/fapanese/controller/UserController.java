package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.ChangePasswordRequest;
import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.service.interfaces.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/users")
public class UserController {
    final IUserService iUserService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserRequest request){
        log.info("Register request: {}", request);

        var result = iUserService.registerUser(request);

        return  ApiResponse.<UserResponse>builder()
                .result(result)
                .build();
    }

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getProfile(){
        log.info("Get profile request");

        UserResponse userResponse = iUserService.getCurrentUserProfile();

        return ApiResponse.<UserResponse>builder()
                .result(userResponse)
                .build();
    }

    @PostMapping("/profile/update")
    private ApiResponse<UserResponse> updateProfile(@RequestBody UserRequest request){
        log.info("Update profile request: {}", request);
        UserResponse userResponse = iUserService.updateUserProfile(request);
        return ApiResponse.<UserResponse>builder()
                .result(userResponse)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{email}")
    public ApiResponse<Void> deleteUserByEmail(@PathVariable String email) {
        iUserService.deleteUserByEmail(email);

        return ApiResponse.<Void>builder()
                .message("User with email " + email + " has been deleted.")
                .build();
    }


    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(@RequestBody ChangePasswordRequest request) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        iUserService.changePassword(username, request);

        return ApiResponse.<Void>builder()
                .message("Đổi mật khẩu thành công")
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{email}/active")
    public ApiResponse<Void> activateUserByAdmin(@PathVariable String email) {
        iUserService.setActiveStatusByEmail(email, 3);

        return ApiResponse.<Void>builder()
                .message("Đã kích hoạt tài khoản " + email + " thành công")
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{email}/deactivate")
    public ApiResponse<Void> deactivateUserByAdmin(@PathVariable String email) {
        iUserService.setActiveStatusByEmail(email, 1);

        return ApiResponse.<Void>builder()
                .message("Vô hiệu hóa tài khoản " + email + " thành công")
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping("/pending-teachers")
    public ApiResponse<List<UserResponse>> getPendingTeachers() {
        List<UserResponse> teachers = iUserService.getPendingTeachers();
        return ApiResponse.<List<UserResponse>>builder()
                .message("Danh sách giáo viên chờ duyệt")
                .result(teachers)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/approve-teacher/{id}")
    public ApiResponse<UserResponse> approveTeacher(@PathVariable String id) {
        UserResponse updated = iUserService.updateStatusById(id, 3);
        return ApiResponse.<UserResponse>builder()
                .message("Phê duyệt giáo viên thành công")
                .result(updated)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/reject-teacher/{id}")
    public ApiResponse<UserResponse> rejectTeacher(@PathVariable String id) {
        UserResponse updated = iUserService.updateStatusById(id, -1);
        return ApiResponse.<UserResponse>builder()
                .message("Từ chối giáo viên thành công")
                .result(updated)
                .build();
    }


}
