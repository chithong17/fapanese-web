package com.ktnl.fapanese.service;


import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.dto.request.IntrospectRequest;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.ktnl.fapanese.dto.response.IntrospectResponse;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
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

    @NonFinal
    @Value("${jwt.signerKey}") // Lấy khóa bí mật từ application.properties (dùng để ký và verify JWT)
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}") // Lấy khóa bí mật từ application.properties (dùng để ký và verify JWT)
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}") // Lấy khóa bí mật từ application.properties (dùng để ký và verify JWT)
    protected long REFRESHABLE_DURATION;

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
     * Hàm introspect: kiểm tra tính hợp lệ của token
     */
    public IntrospectResponse introspect(IntrospectRequest request) throws ParseException, JOSEException {
        var token = request.getToken();
        boolean isvalidToken = true;

        try {
            verifyToken(token, false);
        } catch (AppException e) {
            isvalidToken = false;
        }

        return IntrospectResponse.builder()
                .valid(isvalidToken)
                .build();
    }

    /**
     * Xác minh tính hợp lệ của JWT token (dùng cho cả Access Token và Refresh Token).
     *
     * @param token     JWT cần kiểm tra
     * @param isRefresh true nếu đang kiểm tra trong cơ chế Refresh Token,
     *                  false nếu chỉ kiểm tra Access Token bình thường
     * @return SignedJWT  đối tượng JWT đã parse thành công và hợp lệ
     * @throws AppException nếu token không hợp lệ hoặc đã bị thu hồi
     *
     * Cơ chế hoạt động:
     * 1. Kiểm tra chữ ký token bằng SIGNER_KEY để tránh token giả mạo.
     * 2. Nếu là Access Token (isRefresh = false) → dùng claim "exp" để xác định hạn sử dụng.
     * 3. Nếu là Refresh Token (isRefresh = true) → cho phép token hợp lệ thêm một khoảng REFRESHABLE_DURATION
     *    kể từ thời điểm "iat" (issue time), ngay cả khi "exp" đã hết hạn.
     *    → Điều này cho phép cấp lại Access Token mới mà không cần đăng nhập lại.
     * 4. Kiểm tra token có nằm trong blacklist (InvalidatedToken) hay không
     *    → Nếu có thì nghĩa là user đã logout, token không còn giá trị.
     *
     * => Hàm này đảm bảo chỉ có token hợp lệ (chưa hết hạn / chưa bị thu hồi) mới được tiếp tục sử dụng.
     */
    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        // Tạo verifier với SIGNER_KEY (khóa bí mật dùng để verify chữ ký của token)
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        // Parse chuỗi JWT thành đối tượng SignedJWT để dễ thao tác
        SignedJWT signedJWT = SignedJWT.parse(token);

        // Lấy thời gian refresh hoặc thời gian hết hạn (exp claim) của token
        Date expiryTime;

        if(isRefresh)
            expiryTime = new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                    .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli());
        else
            expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        // Kiểm tra token có chữ ký hợp lệ không (so khớp với SIGNER_KEY)
        var verified = signedJWT.verify(verifier);

        // isRefresh = false: Nếu token không hợp lệ HOẶC đã hết hạn → ném exception
        // isRefresh = true: Nếu token đã hết hạn nhưng vẫn còn trong thời hạn refresh thì sẽ ko ném ra exception
        if(!(verified && expiryTime.after(new Date())))
            throw new AppException(ErrorCode.AUTHENTICATED);

        //từ từ update sau phần logout refresh
        //...
        ///

        // Trả về token hợp lệ để tiếp tục sử dụng
        return signedJWT;




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
                stringJoiner.add("ROLE_" + role.getRoleName());

                // Nếu role có permission thì thêm từng permission vào scope
                if(!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getPermName()));
            });

        return stringJoiner.toString();
    }
}
