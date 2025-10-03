package com.ktnl.fapanese.service;


import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.dto.request.IntrospectRequest;
import com.ktnl.fapanese.dto.request.LogoutRequest;
import com.ktnl.fapanese.dto.request.RefreshRequest;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.ktnl.fapanese.dto.response.IntrospectResponse;
import com.ktnl.fapanese.entity.InvalidatedToken;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.repository.InvalidatedTokenRepository;
import com.ktnl.fapanese.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    TokenValidationService tokenValidationService;

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
            log.info("AAAAAAAAAAAAAAAAAAAAA");
            throw new AppException(ErrorCode.AUTHENTICATED);

        }

        //neu dung generate token
        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        //kiểm tra xem token còn hiệu lực ko (kiểm tra trong tg refreshDuration)
        //nếu ko còn thì verifyToken ném ra Exception Unthenticated nên sẽ stop hàm refreshToken()
        //còn nếu hàm vẫn đc tiếp tục chạy thì token vẫn trong tg refresh
        var signedToken = tokenValidationService.verifyToken(request.getToken(), true);

        //vô hiệu hóa token cũ
        var ijt = signedToken.getJWTClaimsSet().getJWTID();
        var expiryTime = signedToken.getJWTClaimsSet().getExpirationTime();

        //đưa vào blacklist (xóa token cũ)
        invalidatedTokenRepository.save(InvalidatedToken.builder()
                        .id(ijt)
                        .expiryTime(expiryTime)
                .build());

        //tạo token mới
        var email = signedToken.getJWTClaimsSet().getSubject();
        var user = userRepository.findByEmail(email).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTED));

        var newToken = generateToken(user);

        return AuthenticationResponse.builder()
                .token(newToken)
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


    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signedJWT = tokenValidationService.verifyToken(request.getToken(), true);

            var jit = signedJWT.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken = InvalidatedToken
                    .builder()
                    .id(jit)
                    .expiryTime(expiryTime)
                    .build();
            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException e) {
            log.info("Token already expired");
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
                stringJoiner.add("ROLE_" + role.getRoleName());

                // Nếu role có permission thì thêm từng permission vào scope
                if(!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getPermName()));
            });

        return stringJoiner.toString();
    }


}
