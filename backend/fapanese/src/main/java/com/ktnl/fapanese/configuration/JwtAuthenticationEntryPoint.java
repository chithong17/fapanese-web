package com.ktnl.fapanese.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.exception.ErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

/**
 * JwtAuthenticationEntryPoint là nơi xử lý khi request không được xác thực (unauthenticated).
 *
 * Trường hợp thường gặp:
 * - Token không gửi kèm request
 * - Token sai hoặc đã hết hạn
 * - Token không giải mã được
 *
 * Khi Spring Security phát hiện lỗi xác thực, nó sẽ gọi đến commence() để trả về phản hồi JSON chuẩn.
 */
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    /**
     * Hàm này sẽ được Spring Security gọi khi có lỗi AuthenticationException.
     *
     * @param request       request của client
     * @param response      response trả về cho client
     * @param authException ngoại lệ xác thực mà Spring Security phát hiện
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException)
            throws IOException, ServletException {

        // Lấy error code chuẩn đã định nghĩa sẵn (ví dụ: 401 Unauthorized)
        ErrorCode errorCode = ErrorCode.AUTHENTICATED;

        // Set HTTP Status code theo errorCode (ví dụ: 401)
        response.setStatus(errorCode.getStatusCode().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        // Tạo body JSON trả về cho client
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())       // Mã lỗi custom trong hệ thống
                .message(errorCode.getMessage()) // Thông báo lỗi rõ ràng
                .build();

        // Convert object thành JSON string bằng ObjectMapper
        ObjectMapper objectMapper = new ObjectMapper();
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));

        // Gửi phản hồi về client
        response.flushBuffer();
    }
}

