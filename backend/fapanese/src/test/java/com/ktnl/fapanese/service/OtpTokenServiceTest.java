package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.response.EmailResponse;
import com.ktnl.fapanese.dto.response.VerifyOtpResponse;
import com.ktnl.fapanese.entity.OtpToken;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
// SỬA LỖI Ở ĐÂY: Import interface EmailTemplate
import com.ktnl.fapanese.mail.EmailTemplate;
import com.ktnl.fapanese.repository.OtpTokenRepository;
import com.ktnl.fapanese.service.implementations.EmailService;
import com.ktnl.fapanese.service.implementations.OtpTokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class OtpTokenServiceTest {

    @Mock
    private OtpTokenRepository otpRepo;

    @Mock
    private EmailService emailService;

    // SỬA LỖI Ở ĐÂY: Thêm mockTemplate vào danh sách mock
    @Mock
    private EmailTemplate mockTemplate;

    @InjectMocks
    private OtpTokenService otpTokenService;

    // --- Mock cho LocalDateTime.now() ---
    private MockedStatic<LocalDateTime> mockedStaticTime;
    private LocalDateTime mockNow;


    @BeforeEach
    void setUp() {
        // "Đóng băng" thời gian hiện tại
        mockNow = LocalDateTime.of(2025, 11, 14, 20, 30, 0); // 8:30 PM
        // Mock static LocalDateTime::now
        mockedStaticTime = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
        when(LocalDateTime.now()).thenReturn(mockNow);

        // Không cần khởi tạo mockTemplate ở đây nữa,
        // @Mock đã làm việc đó
    }

    @AfterEach
    void tearDown() {
        // Đóng mock static sau mỗi test
        mockedStaticTime.close();
    }

    // --- 1. Test cho generateAndSendOtp ---
    // --- 1. Test cho generateAndSendOtp ---
    // --- 1. Test cho generateAndSendOtp ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/otp/generate_and_send_otp_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản generateAndSendOtp")
    void generateAndSendOtp_Scenarios(String testName, String email, boolean hasArgs) {

        // --- ARRANGE (Given) ---
        EmailResponse mockEmailResponse = EmailResponse.builder()
                .isSuccess(true)
                .to(email)
                .subject("Mock Subject")
                .build();

        // Mock EmailService (phần này vẫn đúng)
        when(emailService.sendEmail(anyString(), any(EmailTemplate.class), any(String.class)))
                .thenReturn(mockEmailResponse);
        when(emailService.sendEmail(anyString(), any(EmailTemplate.class), any(String.class), any(String.class)))
                .thenReturn(mockEmailResponse);

        ArgumentCaptor<OtpToken> tokenCaptor = ArgumentCaptor.forClass(OtpToken.class);

        // --- ACT (When) ---
        EmailResponse result;
        String[] testArgs = {"Test User"};

        if (hasArgs) {
            result = otpTokenService.generateAndSendOtp(email, mockTemplate, testArgs);
        } else {
            result = otpTokenService.generateAndSendOtp(email, mockTemplate);
        }

        // --- ASSERT (Then) ---
        assertNotNull(result);
        assertTrue(result.isSuccess());

        // 1. Kiểm tra OtpToken đã được lưu
        verify(otpRepo, times(1)).save(tokenCaptor.capture());
        OtpToken savedToken = tokenCaptor.getValue();
        String savedOtp = savedToken.getOtpCode();

        // (Các assert khác vẫn giữ nguyên)
        assertNotNull(savedToken);
        assertEquals(email, savedToken.getEmail());
        assertEquals(6, savedToken.getOtpCode().length());
        assertFalse(savedToken.isUsed());
        assertEquals(mockNow.plusMinutes(5), savedToken.getExpiryTime());

        // --- SỬA LỖI Ở CÁC DÒNG VERIFY DƯỚI ĐÂY ---

        // 2. Kiểm tra EmailService đã được gọi đúng
        if (hasArgs) {
            // Dùng eq() cho tất cả các giá trị "thô"
            verify(emailService, times(1)).sendEmail(eq(email), eq(mockTemplate), eq(testArgs[0]), eq(savedOtp));
            verify(emailService, never()).sendEmail(eq(email), eq(mockTemplate), eq(savedOtp));
        } else {
            // Dùng eq() cho tất cả các giá trị "thô"
            verify(emailService, times(1)).sendEmail(eq(email), eq(mockTemplate), eq(savedOtp));
            // Sửa dòng lỗi: Dùng eq() cho 2 arg đầu, và anyString() cho 2 arg sau
            verify(emailService, never()).sendEmail(eq(email), eq(mockTemplate), anyString(), anyString());
        }
    }

    // --- 2. Test cho verifyOtp ---
    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/otp/verify_otp_scenarios.csv", numLinesToSkip = 1)
    @DisplayName("Data-driven: Kịch bản verifyOtp")
    void verifyOtp_Scenarios(String testName, String email, String otpInput,
                             boolean mockTokenFound, boolean mockIsUsed, String mockOtpCode,
                             long mockExpiryMinutesOffset, boolean expectException, String expectedErrorCode) {

        // --- ARRANGE (Given) ---
        if (mockTokenFound) {
            OtpToken mockToken = OtpToken.builder()
                    .email(email)
                    .used(mockIsUsed)
                    .otpCode(mockOtpCode)
                    .expiryTime(mockNow.plusMinutes(mockExpiryMinutesOffset))
                    .build();
            when(otpRepo.findTopByEmailOrderByExpiryTimeDesc(email)).thenReturn(Optional.of(mockToken));
        } else {
            when(otpRepo.findTopByEmailOrderByExpiryTimeDesc(email)).thenReturn(Optional.empty());
        }

        // --- ACT & ASSERT (When & Then) ---
        if (expectException) {
            ErrorCode code = ErrorCode.valueOf(expectedErrorCode);
            AppException e = assertThrows(AppException.class, () -> {
                otpTokenService.verifyOtp(email, otpInput);
            });

            assertEquals(code, e.getErrorCode());
            verify(otpRepo, never()).save(any(OtpToken.class));
        } else {
            // Kịch bản THÀNH CÔNG
            VerifyOtpResponse result = otpTokenService.verifyOtp(email, otpInput);

            assertNotNull(result);
            assertTrue(result.isSuccess());
            assertEquals(email, result.getEmail());

            ArgumentCaptor<OtpToken> captor = ArgumentCaptor.forClass(OtpToken.class);
            verify(otpRepo, times(1)).save(captor.capture());
            assertTrue(captor.getValue().isUsed());
        }
    }
}