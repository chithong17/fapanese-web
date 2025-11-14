package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.request.AuthenticationRequest;
import com.ktnl.fapanese.dto.request.LogoutRequest;
import com.ktnl.fapanese.dto.request.RefreshRequest;
import com.ktnl.fapanese.dto.response.AuthenticationResponse;
import com.ktnl.fapanese.entity.InvalidatedToken;
import com.ktnl.fapanese.entity.Permission;
import com.ktnl.fapanese.entity.Role;
import com.ktnl.fapanese.entity.User;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.repository.InvalidatedTokenRepository;
import com.ktnl.fapanese.repository.UserRepository;
import com.ktnl.fapanese.service.implementations.AuthenticationService;
import com.ktnl.fapanese.service.implementations.TokenValidationService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Mock
    private TokenValidationService tokenValidationService;

    @Mock
    private PasswordEncoder passwordEncoder; // Dùng cho updatePassword

    @InjectMocks
    private AuthenticationService authenticationService;

    private static final String TEST_SIGNER_KEY = "dummy-signer-key-for-testing-must-be-at-least-64-bytes-long-12345";
    private static final long TEST_VALID_DURATION = 3600L;

    private User mockUser;
    private String rawPassword;
    private String hashedPassword;

    // --- Mock dữ liệu cố định cho các kịch bản ---
    private static final String MOCK_JTI = UUID.randomUUID().toString();
    private static final Date MOCK_EXPIRY_TIME = Date.from(Instant.now().plus(1, ChronoUnit.HOURS));
    private static final String MOCK_EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authenticationService, "SIGNER_KEY", TEST_SIGNER_KEY);
        ReflectionTestUtils.setField(authenticationService, "VALID_DURATION", TEST_VALID_DURATION);

        rawPassword = "password123";
        PasswordEncoder realEncoderForLogin = new BCryptPasswordEncoder(10);
        hashedPassword = realEncoderForLogin.encode(rawPassword);

        Permission viewPermission = Permission.builder().permName("VIEW_DATA").build();
        Role userRole = Role.builder().roleName("USER").permissions(Set.of(viewPermission)).build();

        mockUser = User.builder()
                .id(String.valueOf(1L))
                .email(MOCK_EMAIL)
                .password_hash(hashedPassword)
                .status(3) // Status "active" mặc định
                .roles(Set.of(userRole))
                .build();
    }

    // --- 1. Test Login Thành công ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/authentication/login_success.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản Login thành công")
    void login_Success_DataDriven(String testName, String email, String password, String expectedScope)
            throws ParseException, JOSEException {
        // Arrange
        // (Sử dụng rawPassword từ setUp để khớp với hashedPassword)
        AuthenticationRequest request = new AuthenticationRequest(email, rawPassword);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        // Act
        AuthenticationResponse response = authenticationService.login(request);

        // Assert
        assertNotNull(response);
        assertTrue(response.isAuthenticated());
        assertNotNull(response.getToken());

        SignedJWT signedJWT = SignedJWT.parse(response.getToken());
        assertTrue(signedJWT.verify(new MACVerifier(TEST_SIGNER_KEY.getBytes())));
        assertEquals(email, signedJWT.getJWTClaimsSet().getSubject());
        assertEquals(expectedScope, signedJWT.getJWTClaimsSet().getClaim("scope"));
    }

    // --- 2. Test Login Thất bại (Gộp 5 kịch bản) ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/authentication/login_failures.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Các kịch bản Login thất bại")
    void login_Failures_DataDriven(String testName, String email, String password,
                                   boolean mockUserFound, int userStatus, String expectedErrorCodeString) {
        // Arrange
        ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
        AuthenticationRequest request = new AuthenticationRequest(email, password);

        // Logic mock phức tạp dựa trên file CSV
        if (mockUserFound) {
            // Nếu tìm thấy user, gán status từ file CSV (chỉ dùng rawPassword nếu là test sai pass)
            if (testName.equals("WRONG_PASSWORD")) {
                mockUser.setStatus(userStatus);
            } else {
                mockUser.setStatus(userStatus);
                // Gán đúng password để vượt qua vòng check password
                request.setPassword(rawPassword);
            }
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        } else {
            // Kịch bản USER_NOT_FOUND
            when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        }

        // Act & Assert
        AppException exception = assertThrows(AppException.class, () -> {
            authenticationService.login(request);
        });
        assertEquals(expectedErrorCode, exception.getErrorCode());
    }

    // --- 3. Test Refresh Token (Gộp 3 kịch bản) ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/authentication/refresh_token_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Các kịch bản Refresh Token (Đây là ví dụ về anti-pattern)")
    void refreshToken_Scenarios_DataDriven(String testName, String token,
                                           boolean mockVerifyTokenSuccess, boolean mockUserFound,
                                           boolean expectException, String expectedErrorCodeString,
                                           int expectSaveToBlacklist)
            throws ParseException, JOSEException {

        // Arrange
        RefreshRequest request = new RefreshRequest(token);
        SignedJWT signedJWT = mock(SignedJWT.class);
        JWTClaimsSet claimsSet = mock(JWTClaimsSet.class);

        // --- Logic Mock phức tạp ---
        if (mockVerifyTokenSuccess) {
            when(claimsSet.getJWTID()).thenReturn(MOCK_JTI);
            when(claimsSet.getExpirationTime()).thenReturn(MOCK_EXPIRY_TIME);
            when(claimsSet.getSubject()).thenReturn(MOCK_EMAIL);
            when(signedJWT.getJWTClaimsSet()).thenReturn(claimsSet);
            when(tokenValidationService.verifyToken(token, true)).thenReturn(signedJWT);

            if (mockUserFound) {
                // Kịch bản REFRESH_SUCCESS
                when(userRepository.findByEmail(MOCK_EMAIL)).thenReturn(Optional.of(mockUser));
            } else {
                // Kịch bản USER_NOT_FOUND (sau khi verify thành công)
                when(userRepository.findByEmail(MOCK_EMAIL)).thenReturn(Optional.empty());
            }
        } else {
            // Kịch bản INVALID_TOKEN
            when(tokenValidationService.verifyToken(token, true))
                    .thenThrow(new AppException(ErrorCode.AUTHENTICATED));
        }

        // --- Act & Assert ---
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException exception = assertThrows(AppException.class, () -> {
                authenticationService.refreshToken(request);
            });
            assertEquals(expectedErrorCode, exception.getErrorCode());
        } else {
            // Kịch bản REFRESH_SUCCESS
            AuthenticationResponse response = authenticationService.refreshToken(request);
            assertNotNull(response);
            assertTrue(response.isAuthenticated());
            assertNotNull(response.getToken());
            assertNotEquals(token, response.getToken());
        }

        // Kiểm tra xem có lưu vào blacklist hay không
        verify(invalidatedTokenRepository, times(expectSaveToBlacklist)).save(any(InvalidatedToken.class));
    }

    // --- 4. Test Logout (Gộp 2 kịch bản) ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/authentication/logout_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Các kịch bản Logout")
    void logout_Scenarios_DataDriven(String testName, String token,
                                     boolean mockVerifyTokenSuccess, int expectSaveToBlacklist)
            throws ParseException, JOSEException {

        // Arrange
        LogoutRequest request = new LogoutRequest(token);

        if (mockVerifyTokenSuccess) {
            SignedJWT signedJWT = mock(SignedJWT.class);
            JWTClaimsSet claimsSet = mock(JWTClaimsSet.class);
            when(claimsSet.getJWTID()).thenReturn(MOCK_JTI);
            when(claimsSet.getExpirationTime()).thenReturn(MOCK_EXPIRY_TIME);
            when(signedJWT.getJWTClaimsSet()).thenReturn(claimsSet);
            when(tokenValidationService.verifyToken(token, true)).thenReturn(signedJWT);
        } else {
            // Kịch bản TOKEN_ALREADY_EXPIRED
            when(tokenValidationService.verifyToken(token, true))
                    .thenThrow(new AppException(ErrorCode.AUTHENTICATED)); // Lỗi này sẽ bị catch
        }

        // Act
        // Hàm logout không ném ra lỗi ngay cả khi token hết hạn
        assertDoesNotThrow(() -> {
            authenticationService.logout(request);
        });

        // Assert
        verify(invalidatedTokenRepository, times(expectSaveToBlacklist)).save(any(InvalidatedToken.class));
    }

    // --- 5. Test Update Password (Gộp 2 kịch bản) ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/authentication/update_password_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Các kịch bản Update Password")
    void updatePassword_Scenarios_DataDriven(String testName, String email, String newPassword,
                                             boolean mockUserFound, boolean expectException,
                                             String expectedErrorCodeString, int expectSave) {
        // Arrange
        if (mockUserFound) {
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
            when(passwordEncoder.encode(newPassword)).thenReturn("hashed-" + newPassword);
        } else {
            when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        }

        // Act & Assert
        if (expectException) {
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);
            AppException exception = assertThrows(AppException.class, () -> {
                authenticationService.updatePassword(email, newPassword);
            });
            assertEquals(expectedErrorCode, exception.getErrorCode());
        } else {
            // Kịch bản UPDATE_SUCCESS
            authenticationService.updatePassword(email, newPassword);
        }

        // Assert
        verify(userRepository, times(expectSave)).save(any(User.class));
        if (expectSave == 0) {
            verify(passwordEncoder, never()).encode(anyString());
        }
    }

    @Test
    @DisplayName("Coverage: Bắt lỗi khi generateToken thất bại (khối catch)")
    void generateToken_ThrowsRuntimeException_OnBadSignerKey() {
        // Arrange
        // Làm hỏng SIGNER_KEY (HS512 yêu cầu key dài)
        ReflectionTestUtils.setField(authenticationService, "SIGNER_KEY", "invalid-short-key");

        AuthenticationRequest request = new AuthenticationRequest(MOCK_EMAIL, rawPassword);
        when(userRepository.findByEmail(MOCK_EMAIL)).thenReturn(Optional.of(mockUser));

        // Act & Assert
        // Xác nhận rằng RuntimeException đã được ném ra từ khối catch
        assertThrows(RuntimeException.class, () -> {
            authenticationService.login(request);
        });
    }

    @Test
    @DisplayName("Coverage: Xử lý buildScope cho User không có Role (nhánh if đầu tiên)")
    void buildScope_HandlesUserWithNoRoles() throws ParseException, JOSEException {
        // Arrange
        // Tạo user KHÔNG CÓ role
        User userWithNoRoles = User.builder()
                .id(String.valueOf(2L))
                .email("norole@example.com")
                .password_hash(hashedPassword)
                .status(3)
                .roles(Set.of()) // <-- Role rỗng
                .build();

        AuthenticationRequest request = new AuthenticationRequest("norole@example.com", rawPassword);
        when(userRepository.findByEmail("norole@example.com")).thenReturn(Optional.of(userWithNoRoles));

        // Act
        AuthenticationResponse response = authenticationService.login(request);

        // Assert
        // Scope claim phải là một chuỗi rỗng
        SignedJWT signedJWT = SignedJWT.parse(response.getToken());
        String scope = (String) signedJWT.getJWTClaimsSet().getClaim("scope");
        assertEquals("", scope);
    }

    @Test
    @DisplayName("Coverage: Xử lý buildScope cho Role không có Permission (nhánh if thứ hai)")
    void buildScope_HandlesRoleWithNoPermissions() throws ParseException, JOSEException {
        // Arrange
        // Tạo một Role KHÔNG CÓ permission
        Role guestRole = Role.builder()
                .roleName("GUEST")
                .permissions(Set.of()) // <-- Permission rỗng
                .build();

        User userWithRoleNoPerms = User.builder()
                .id(String.valueOf(3L))
                .email("guest@example.com")
                .password_hash(hashedPassword)
                .status(3)
                .roles(Set.of(guestRole)) // Gán role đó cho user
                .build();

        AuthenticationRequest request = new AuthenticationRequest("guest@example.com", rawPassword);
        when(userRepository.findByEmail("guest@example.com")).thenReturn(Optional.of(userWithRoleNoPerms));

        // Act
        AuthenticationResponse response = authenticationService.login(request);

        // Assert
        // Scope claim chỉ được chứa role, không chứa permission
        SignedJWT signedJWT = SignedJWT.parse(response.getToken());
        String scope = (String) signedJWT.getJWTClaimsSet().getClaim("scope");
        assertEquals("ROLE_GUEST", scope);
    }
}