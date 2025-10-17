package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.ChangePasswordRequest;
import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.service.interfaces.IUserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    IUserService iUserService;
    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserRequest request){
        log.info("Register request: {}", request);

        var result = iUserService.registerUser(request);

        return  ApiResponse.<UserResponse>builder()
                .result(result)
                .build();
    }

    @GetMapping("/profile")
    private ApiResponse<UserResponse> getProfile(){
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

    @DeleteMapping("/{email}")
    public ResponseEntity<String> deleteUserByEmail(@PathVariable String email) {
        iUserService.deleteUserByEmail(email);
        return ResponseEntity.ok("User with email " + email + " has been deleted.");
    }


    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(@RequestBody ChangePasswordRequest request) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        iUserService.changePassword(username, request);

        return ApiResponse.<Void>builder()
                .message("Đổi mật khẩu thành công")
                .build();
    }
}
