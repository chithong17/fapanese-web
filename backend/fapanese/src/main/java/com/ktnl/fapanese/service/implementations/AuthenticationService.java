package com.ktnl.fapanese.service.implementations;


import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.ktnl.fapanese.dto.response.UserResponse;
import com.ktnl.fapanese.entity.RefreshToken;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.repository.RefreshTokenRepository;
import com.ktnl.fapanese.repository.UserRepository;
import com.ktnl.fapanese.service.interfaces.IAuthenticationService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.StringJoiner;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService implements IAuthenticationService {
    UserRepository userRepository;
    TokenValidationService tokenValidationService;
    RefreshTokenRepository refreshTokenRepository;
    UserService userService;

    @NonFinal
    @Value("${jwt.signerKey}") // Lấy khóa bí mật từ application.properties (dùng để ký và verify JWT)
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;


    @Autowired
    PasswordEncoder passwordEncoder;

    @Transactional
    public AuthenticationResponse login(AuthenticationRequest request){
        var user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(user.getStatus() == 0)
            throw new AppException(ErrorCode.USER_NOT_VERIFY_EMAIL);
        if(user.getStatus() == 1)
            throw new AppException(ErrorCode.USER_NOT_ISACTIVED);
        if(user.getStatus() == 2)
            throw new AppException(ErrorCode.USER_NEED_ADMIN_APPROVAL);

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        //check xem password khop chua
        var authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword_hash());

        //neu sai nem ra exception
        if(!authenticated)
            throw new AppException(ErrorCode.LOGIN_FAIL);

        //neu dung generate token
        var accessToken = generateAccessToken(user);
        var refreshToken = generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .authenticated(true)
                .build();
    }

    @Override
    public AuthenticationResponse loginSocial(UserResponse request) {
        User user = userService.registerSocialUser(request);

        var accessToken = generateAccessToken(user);
        var refreshToken = generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .authenticated(true)
                .build();
    }

    @Transactional
    public AuthenticationResponse refreshToken(String requestRefreshToken) throws ParseException, JOSEException {
        if (requestRefreshToken.isEmpty())
            throw new AppException(ErrorCode.AUTHENTICATED);


        // B1: Tìm token trong DB
        var storedToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHENTICATED)); // Token không tồn tại

        // B2: Check Hack (Token đã dùng rồi mà đem ra xài lại?)
        if (storedToken.isUsed()) {
            // Xóa tất cả token của user này để bắt đăng nhập lại
            refreshTokenRepository.deleteAllByUser(storedToken.getUser());
            log.warn("BÁO ĐỘNG: REFRESH TOKEN ĐƯỢC SỬ DỤNG LẠI");
            throw new AppException(ErrorCode.TOKEN_REUSED); // Hoặc tạo ErrorCode.TOKEN_REUSED
        }

        // B3: Check Hết hạn hoặc đã Logout
        if (storedToken.getExpiryDate().isBefore(Instant.now()) || storedToken.isRevoked()) {
            throw new AppException(ErrorCode.EXPIRED_SESSION);
        }

        // B4: Đánh dấu token cũ là ĐÃ DÙNG (Rotation)
        storedToken.setUsed(true);
        refreshTokenRepository.save(storedToken);

        // B5: Tạo cặp token mới
        var user = storedToken.getUser();
        var newAccessToken = generateAccessToken(user);
        var newRefreshToken = generateRefreshToken(user);

        // B6: Trả về cặp mới
        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .authenticated(true)
                .build();
    }




    @Transactional
    public void logout(String refreshToken) throws ParseException, JOSEException {
        if (refreshToken != null) {
            var storedToken = refreshTokenRepository.findByToken(refreshToken)
                    .orElse(null);

            if (storedToken != null) {
                storedToken.setRevoked(true);
                refreshTokenRepository.save(storedToken);
            }
        }
    }

    /**
     * Sinh JWT token cho user
     */
    private String generateAccessToken(User user){
        // Header của JWT: sử dụng thuật toán HS512
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        // Body (payload) chứa các claim
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail()) // định danh của token
                .issuer("ktnl.com") // nơi phát hành token
                .issueTime(new Date()) // thời gian phát hành
                .expirationTime(new Date(Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli())) // hết hạn sau 15p
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

    private RefreshToken generateRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS))
                .isRevoked(false)
                .isUsed(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
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


    public void updatePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPassword_hash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

}
