package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserRequest request){
        log.info("Register request: {}", request);

        var result = userService.registerUser(request);

        return  ApiResponse.<UserResponse>builder()
                .result(result)
                .build();
    }

    @GetMapping("/profile")
    private ApiResponse<UserResponse> getProfile(){
        log.info("Get profile request");

        UserResponse userResponse = userService.getCurrentUserProfile();

        return ApiResponse.<UserResponse>builder()
                .result(userResponse)
                .build();
    }

    @PostMapping("/profile/update")
    private ApiResponse<UserResponse> updateProfile(@RequestBody UserRequest request){
        log.info("Update profile request: {}", request);
        UserResponse userResponse = userService.updateUserProfile(request);
        return ApiResponse.<UserResponse>builder()
                .result(userResponse)
                .build();
    }
}
