package com.ktnl.fapanese.controller;


import com.ktnl.fapanese.dto.request.*;
import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.ktnl.fapanese.dto.response.EmailResponse;
import com.ktnl.fapanese.dto.response.VerifyOtpResponse;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.mail.ForgotPasswordEmail;
import com.ktnl.fapanese.mail.VerifyOtpEmail;
import com.ktnl.fapanese.service.interfaces.IAuthenticationService;
import com.ktnl.fapanese.service.interfaces.IOtpTokenService;
import com.ktnl.fapanese.service.interfaces.IUserService;
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
    IAuthenticationService iAuthenticationService;
    IOtpTokenService iOtpTokenService;
    IUserService iUserService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request){
        var result = iAuthenticationService.login(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refreshToken(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        var result = iAuthenticationService.refreshToken(request);

        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void>logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        iAuthenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/send-otp")
    public ApiResponse<EmailResponse> sendOtp(@RequestBody OtpRequest request) {
        var result = iOtpTokenService.generateAndSendOtp(request.getEmail(), new VerifyOtpEmail());

        return ApiResponse.<EmailResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/verify-otp")
    public ApiResponse<VerifyOtpResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        //nếu xác thực thành công hàm mới đc đi tiếp
        //nếu xác thực OTP thất bại hàm verifyOtp sẽ ném ra Exception nên hàm bị dừng ở câu lệnh này
        var result = iOtpTokenService.verifyOtp(request.getEmail(), request.getOtp());

        iUserService.updateStatusUserAfterVerifyOtp(request.getEmail());

        return ApiResponse.<VerifyOtpResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<EmailResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        var result = iOtpTokenService.generateAndSendOtp(request.getEmail(), new ForgotPasswordEmail(), request.getEmail());

        return ApiResponse.<EmailResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<VerifyOtpResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            // verifyOtp sẽ ném AppException nếu sai
            var verifyResult = iOtpTokenService.verifyOtp(request.getEmail(), request.getOtp());

            // Nếu tới đây tức là OTP hợp lệ → cập nhật mật khẩu
            iAuthenticationService.updatePassword(request.getEmail(), request.getNewPassword());

            var response = VerifyOtpResponse.builder()
                    .isSuccess(true)
                    .email(request.getEmail())
                    .message("Mật khẩu đã được đặt lại thành công!")
                    .build();

            return ApiResponse.<VerifyOtpResponse>builder()
                    .result(response)
                    .build();

        } catch (AppException ex) {
            var response = VerifyOtpResponse.builder()
                    .isSuccess(false)
                    .email(request.getEmail())
                    .message(ex.getMessage())
                    .build();

            return ApiResponse.<VerifyOtpResponse>builder()
                    .result(response)
                    .build();
        }
    }


}
