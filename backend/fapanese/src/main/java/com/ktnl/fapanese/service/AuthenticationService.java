package com.ktnl.fapanese.service;


import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;

    @NonFinal
    @Value("${jwt.signerKey}") // Lấy khóa bí mật từ application.properties (dùng để ký và verify JWT)
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}") // Lấy khóa bí mật từ application.properties (dùng để ký và verify JWT)
    protected long VALID_DURATION;

    public AuthenticationResponse login(AuthenticationRequest request){
        var user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        //check xem password khop chua
        var authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword_hash());

        //neu sai nem ra exception
        if(!authenticated){
            throw new AppException(ErrorCode.AUTHENTICATED);
        }

        //neu dung generate token
        var token = generateToken(user);


        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    /**
     * Sinh JWT token cho user
     */
    private String generateToken(User user){
        // Header của JWT: sử dụng thuật toán HS512
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        // Body (payload) chứa các claim
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail()) // định danh của token
                .issuer("ktnl.com") // nơi phát hành token
                .issueTime(new Date()) // thời gian phát hành
                .expirationTime(new Date(Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli())) // hết hạn sau 1h
                .jwtID(UUID.randomUUID().toString()) // id ngẫu nhiên cho token
                .claim("scope", buildScope(user)) // thêm claim "scope" (chứa role và permission)
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        // Tạo JWSObject từ header + payload
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            // Ký token bằng SIGNER_KEY
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize(); // Trả về token dưới dạng chuỗi
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }

    }


    /**
     * Tạo scope cho user từ roles và permissions
     * Ví dụ: "ROLE_ADMIN READ_USER WRITE_USER"
     */
    private String buildScope(User user){
        StringJoiner stringJoiner = new StringJoiner(" ");

        // Nếu user có role thì thêm ROLE_xxx vào scope
        if(!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());

                // Nếu role có permission thì thêm từng permission vào scope
                if(!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });

        return stringJoiner.toString();
    }
}
