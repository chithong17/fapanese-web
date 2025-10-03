package com.ktnl.fapanese.controller;


import com.ktnl.fapanese.dto.request.*;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.ktnl.fapanese.dto.response.EmailResponse;
import com.ktnl.fapanese.dto.response.VerifyOtpResponse;
import com.ktnl.fapanese.service.AuthenticationService;
import com.ktnl.fapanese.service.OtpTokenService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@Slf4j
@RestController
@RequestMapping({"/api/auth"})
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;
    OtpTokenService  otpTokenService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request){
        var result = authenticationService.login(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refreshToken(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);

        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void>logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/send-otp")
    public ApiResponse<EmailResponse> sendOtp(@RequestBody OtpRequest request) {
        var result = otpTokenService.generateAndSendOtp(request.getEmail());

        return ApiResponse.<EmailResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/verify-otp")
    public ApiResponse<VerifyOtpResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        var result = otpTokenService.verifyOtp(request.getEmail(), request.getOtp());

        return ApiResponse.<VerifyOtpResponse>builder()
                .result(result)
                .build();

    }


}
