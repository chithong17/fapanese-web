package com.ktnl.fapanese.configuration;

import com.ktnl.fapanese.dto.request.IntrospectRequest;
import com.ktnl.fapanese.service.AuthenticationService;
import com.ktnl.fapanese.service.TokenValidationService;
import com.nimbusds.jose.JOSEException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.util.Objects;

// CustomJwtDecoder: lớp tự định nghĩa để giải mã và xác thực JWT trong Spring Security
@Component
public class CustomJwtDecoder implements JwtDecoder {

    // Khóa bí mật dùng để verify chữ ký của JWT (được cấu hình trong application.properties)
    @Value("${jwt.signerKey}")
    private String signerKey;

    // Service dùng để introspect token (gửi token sang AuthenticationService để kiểm tra)
    @Autowired
    private TokenValidationService tokenValidationService;

    // Đối tượng NimbusJwtDecoder (thư viện hỗ trợ decode/verify JWT)
    private NimbusJwtDecoder nimbusJwtDecoder = null;


    @Override
    public Jwt decode(String token){
        try {
            // B1: Gọi API introspect để kiểm tra token có hợp lệ hay không (DB, blacklist,...)
            var response = tokenValidationService.introspect(IntrospectRequest.builder().token(token).build());

            // Nếu introspect báo token không hợp lệ → ném exception
            if (!response.isValid())
                throw new JwtException("Token invalid");
        } catch (ParseException | JOSEException e) {
            // Nếu có lỗi khi parse hoặc verify token → ném JwtException
            throw new JwtException(e.getMessage());
        }

        // B2: Nếu NimbusJwtDecoder chưa được khởi tạo → tạo mới với signerKey
        if(Objects.isNull(nimbusJwtDecoder)){
            // Tạo SecretKeySpec từ signerKey với thuật toán HMAC-SHA512
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");

            // Khởi tạo NimbusJwtDecoder với key và thuật toán HMAC-SHA512
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        // B3: Dùng NimbusJwtDecoder decode + verify chữ ký JWT
        return nimbusJwtDecoder.decode(token);
    }
}
