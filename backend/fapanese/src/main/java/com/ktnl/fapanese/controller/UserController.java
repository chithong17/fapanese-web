package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.dto.request.UserRequest;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody UserRequest request){
        log.info("Register request: {}", request);

        var result = userService.registerUser(request);

        return  ApiResponse.<UserResponse>builder()
                .result(result)
                .build();
    }
}
