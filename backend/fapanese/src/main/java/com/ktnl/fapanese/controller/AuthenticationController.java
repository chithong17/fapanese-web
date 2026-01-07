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
import jakarta.servlet.http.Cookie;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @NonFinal
    @Value("${auth.cookie.secure}")
    boolean IS_COOKIE_SECURE;
    @NonFinal
    @Value("${auth.cookie.same-site}")
    String SAME_SITE;
    @NonFinal
    @Value("${jwt.refreshable-duration}")
    int REFRESHABLE_DURATION;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(@RequestBody AuthenticationRequest request){
        //login
        var result = iAuthenticationService.login(request);

        //Tạo Cookie chứa Refresh Token
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(IS_COOKIE_SECURE) // Đọc từ config
                .path("/")
                .maxAge(REFRESHABLE_DURATION) // 30 ngày (tương ứng với logic service)
                .sameSite(SAME_SITE)
                .build();

        //Xóa Refresh Token trong Body trả về (để client không thấy)
        result.setRefreshToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(ApiResponse.<AuthenticationResponse>builder()
                        .result(result)
                        .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refreshToken(@CookieValue(name = "refreshToken", defaultValue = "") String requestRefreshToken) throws ParseException, JOSEException {
        var result = iAuthenticationService.refreshToken(requestRefreshToken);

        // Tạo Cookie mới (Rotation)
        ResponseCookie newRefreshTokenCookie = ResponseCookie.from("refreshToken", result.getRefreshToken())
                .httpOnly(true)
                .secure(IS_COOKIE_SECURE)
                .path("/")
                .maxAge(REFRESHABLE_DURATION)
                .sameSite(SAME_SITE)
                .build();

        result.setRefreshToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newRefreshTokenCookie.toString())
                .body(ApiResponse.<AuthenticationResponse>builder()
                        .result(result)
                        .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>>logout(@CookieValue(name = "refreshToken", defaultValue = "") String refreshToken) throws ParseException, JOSEException {
        iAuthenticationService.logout(refreshToken);

        // Xóa Cookie phía Client (Set maxAge = 0)
        ResponseCookie cleanCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(IS_COOKIE_SECURE)
                .path("/")
                .maxAge(0) // Hết hạn ngay
                .sameSite(SAME_SITE)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .body(ApiResponse.<Void>builder().message("Đăng xuất thành công").build());
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
