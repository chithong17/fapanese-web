package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.IntrospectRequest;
import com.ktnl.fapanese.dto.response.IntrospectResponse;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.service.implementations.TokenValidationService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

@ExtendWith(MockitoExtension.class)
class TokenValidationServiceTest {

    // Dùng @Spy để tạo một đối tượng thật, cho phép chúng ta
    // mock một phần (hàm introspect) và gọi thật (hàm verifyToken)
    @Spy
    private TokenValidationService tokenValidationService = new TokenValidationService();

    // Các hằng số (constants) dùng để test
    private static final String TEST_KEY = "day-la-key-bi-mat-sieu-dai-de-test-jwt-hs256";
    private static final String WRONG_KEY = "day-la-mot-cai-key-SAI-hoan-toan-khong-lien-quan";
    private static final long VALID_DURATION_SECONDS = 10; // 10 giây
    private static final long REFRESHABLE_DURATION_SECONDS = 60; // 60 giây

    @BeforeEach
    void setUp() {
        // Dùng ReflectionTestUtils để "ép" giá trị vào các trường @Value
        ReflectionTestUtils.setField(tokenValidationService, "SIGNER_KEY", TEST_KEY);
        ReflectionTestUtils.setField(tokenValidationService, "VALID_DURATION", VALID_DURATION_SECONDS);
        ReflectionTestUtils.setField(tokenValidationService, "REFRESHABLE_DURATION", REFRESHABLE_DURATION_SECONDS);
    }

    // ============================================================
    // 1. TEST HÀM introspect (Data-driven)
    // ============================================================

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(
            resources = "/com/ktnl/fapanese/service/token/introspect.csv",
            numLinesToSkip = 1
    )
    @DisplayName("Data-driven: introspect")
    @SneakyThrows // Ẩn lỗi (checked exception)
    void introspect_Scenarios(
            String testName,
            String token,
            boolean expectedValid
    ) {
        // 1. --- ARRANGE ---
        IntrospectRequest request = new IntrospectRequest(token);

        // Giả lập (mock) hàm verifyToken bên trong
        if (expectedValid) {
            // Nếu test case mong đợi valid=true, giả lập verifyToken chạy OK
            doReturn(null).when(tokenValidationService).verifyToken(token, false);
        } else {
            // Nếu test case mong đợi valid=false, giả lập verifyToken ném lỗi
            doThrow(new AppException(ErrorCode.AUTHENTICATED))
                    .when(tokenValidationService).verifyToken(token, false);
        }

        // 2. --- ACT ---
        IntrospectResponse response = tokenValidationService.introspect(request);

        // 3. --- ASSERT ---
        assertNotNull(response);
        assertEquals(expectedValid, response.isValid());
    }

    // ============================================================
    // 2. TEST HÀM verifyToken (Dùng @Test riêng lẻ)
    //
    // Hàm này phức tạp, liên quan đến thời gian và chữ ký,
    // nên dùng @Test riêng lẻ sẽ rõ ràng hơn.
    // ============================================================

    @Test
    @DisplayName("verifyToken - Access Token còn hạn - Success")
    @SneakyThrows
    void verifyToken_ValidAccessToken_Success() {
        Date now = new Date();
        Date iat = new Date(now.getTime() - 5_000); // 5 giây trước
        Date exp = new Date(now.getTime() + 3600_000); // 1 giờ sau
        String token = generateToken(TEST_KEY, iat, exp, "user1");

        // ACT & ASSERT
        // (isRefresh = false)
        assertDoesNotThrow(() -> tokenValidationService.verifyToken(token, false));
    }

    @Test
    @DisplayName("verifyToken - Access Token hết hạn - Fail")
    @SneakyThrows
    void verifyToken_ExpiredAccessToken_Fail() {
        Date now = new Date();
        Date iat = new Date(now.getTime() - 3600_000); // 1 giờ trước
        Date exp = new Date(now.getTime() - 5_000); // 5 giây trước (đã hết hạn)
        String token = generateToken(TEST_KEY, iat, exp, "user1");

        // ACT & ASSERT
        // (isRefresh = false)
        AppException ex = assertThrows(AppException.class,
                () -> tokenValidationService.verifyToken(token, false));

        assertEquals(ErrorCode.AUTHENTICATED, ex.getErrorCode());
    }

    @Test
    @DisplayName("verifyToken - Token sai chữ ký (Wrong Key) - Fail")
    @SneakyThrows
    void verifyToken_WrongSignature_Fail() {
        Date now = new Date();
        Date iat = new Date(now.getTime() - 5_000);
        Date exp = new Date(now.getTime() + 3600_000);
        // Dùng WRONG_KEY để ký
        String token = generateToken(WRONG_KEY, iat, exp, "user1");

        // ACT & ASSERT
        // Service sẽ dùng TEST_KEY để verify -> thất bại
        AppException ex = assertThrows(AppException.class,
                () -> tokenValidationService.verifyToken(token, false));

        assertEquals(ErrorCode.AUTHENTICATED, ex.getErrorCode());
    }

    @Test
    @DisplayName("verifyToken - Refresh Token còn hạn (Token đã 'exp' nhưng 'iat' còn trong REFRESHABLE_DURATION) - Success")
    @SneakyThrows
    void verifyToken_ExpiredToken_AsRefreshToken_Success() {
        // Setup: VALID_DURATION = 10 giây, REFRESHABLE_DURATION = 60 giây
        Date now = new Date();
        // Token được cấp 30 giây trước (còn trong 60s refresh)
        Date iat = new Date(now.getTime() - 30_000);
        // Token hết hạn 15 giây trước (đã qua 10s valid)
        Date exp = new Date(now.getTime() - 15_000);
        String token = generateToken(TEST_KEY, iat, exp, "user1");

        // ACT & ASSERT
        // (isRefresh = true) -> sẽ dùng iat + REFRESHABLE_DURATION
        // iat (30s trước) + 60s = 30s nữa mới hết hạn -> Hợp lệ
        assertDoesNotThrow(() -> tokenValidationService.verifyToken(token, true));
    }

    @Test
    @DisplayName("verifyToken - Refresh Token hết hạn (Token đã 'exp' VÀ 'iat' đã qua REFRESHABLE_DURATION) - Fail")
    @SneakyThrows
    void verifyToken_FullyExpiredToken_AsRefreshToken_Fail() {
        // Setup: VALID_DURATION = 10 giây, REFRESHABLE_DURATION = 60 giây
        Date now = new Date();
        // Token được cấp 90 giây trước (đã qua 60s refresh)
        Date iat = new Date(now.getTime() - 90_000);
        // Token hết hạn 75 giây trước (đã qua 10s valid)
        Date exp = new Date(now.getTime() - 75_000);
        String token = generateToken(TEST_KEY, iat, exp, "user1");

        // ACT & ASSERT
        // (isRefresh = true)
        // iat (90s trước) + 60s = 30s trước (đã hết hạn) -> Không hợp lệ
        AppException ex = assertThrows(AppException.class,
                () -> tokenValidationService.verifyToken(token, true));

        assertEquals(ErrorCode.AUTHENTICATED, ex.getErrorCode());
    }


    // ============================================================
    // 3. HÀM PHỤ TRỢ (Helper Method)
    // ============================================================

    /**
     * Hàm helper để tạo một JWT thật dùng cho việc test.
     */
    @SneakyThrows // Ẩn các lỗi (checked exception) của nimbusds
    private String generateToken(String signerKey, Date iat, Date exp, String subject) {
        // 1. Tạo Header
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        // 2. Tạo ClaimsSet (payload)
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(subject)
                .issueTime(iat)
                .expirationTime(exp)
                .build();

        // 3. Tạo SignedJWT
        SignedJWT signedJWT = new SignedJWT(header, claimsSet);

        // 4. Ký token
        JWSSigner signer = new MACSigner(signerKey.getBytes());
        signedJWT.sign(signer);

        // 5. Trả về chuỗi token
        return signedJWT.serialize();
    }
}
