package com.ktnl.fapanese.service; // Đảm bảo package này khớp

import com.ktnl.fapanese.dto.response.EmailResponse;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mail.EmailTemplate; // Import interface của bạn
import com.ktnl.fapanese.service.implementations.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

// (SỬA) Thêm import cho Map và HashMap
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mockMimeMessage;

    // --- (SỬA) Thêm mock cho từng loại template ---
    @Mock
    private EmailTemplate mockConfirmTemplate;
    @Mock
    private EmailTemplate mockResetTemplate;

    // --- (SỬA) Thêm Map để tra cứu template ---
    private Map<String, EmailTemplate> templateMap;

    @InjectMocks
    private EmailService emailService;

    private static final String FROM_EMAIL = "test@fapanese.com";

    @BeforeEach
    void setUp() {
        // Cấu hình giá trị @Value
        ReflectionTestUtils.setField(emailService, "from", FROM_EMAIL);

        // Stub lời gọi createMimeMessage
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);

        // --- (SỬA) Giả lập hành vi cho các mock template ---

        // 1. Mock cho kịch bản "CONFIRM_REGISTER"
        when(mockConfirmTemplate.getSubject()).thenReturn("Mocked Subject: Xác nhận đăng ký");
        when(mockConfirmTemplate.getContent(any(String[].class))) // Chấp nhận mọi tham số
                .thenReturn("<h1>Mocked Content: Chào mừng User A</h1>");

        // 2. Mock cho kịch bản "RESET_PASSWORD"
        when(mockResetTemplate.getSubject()).thenReturn("Mocked Subject: Đặt lại mật khẩu");
        when(mockResetTemplate.getContent(any(String[].class))) // Chấp nhận mọi tham số
                .thenReturn("<p>Mocked Content: Link reset</p>");

        // 3. Đưa các mock vào Map để tra cứu
        templateMap = new HashMap<>();
        templateMap.put("CONFIRM_REGISTER", mockConfirmTemplate);
        templateMap.put("RESET_PASSWORD", mockResetTemplate);
    }

    @ParameterizedTest(name = "{0}")
    @CsvFileSource(resources = "/com/ktnl/fapanese/service/email/send_email_scenarios.csv", numLinesToSkip = 1, nullValues = {""})
    @DisplayName("Data-driven: Kịch bản sendEmail")
    void sendEmail_Scenarios(String testName, String toEmail, String templateName, String csvArgs,
                             boolean mockSendThrowsException, boolean expectException, String expectedErrorCodeString)
            throws MessagingException { // <-- Giữ nguyên throws MessagingException

        // Arrange
        EmailTemplate template = templateMap.get(templateName);
        assertNotNull(template, "Không tìm thấy mock template cho: " + templateName + ". Hãy kiểm tra hàm setUp().");

        String[] args = (csvArgs == null) ? new String[0] : csvArgs.split(";");

        if (mockSendThrowsException) {
            // Kịch bản Lỗi:
            // helper.setSubject(...) sẽ gọi message.setSubject(subject, "UTF-8")
            // Phương thức này CÓ ném ra MessagingException và sẽ kích hoạt khối catch.

            // --- SỬA TỪ ĐÂY ---
            doThrow(new MessagingException("Mocked setSubject failure"))
                    .when(mockMimeMessage).setSubject(anyString(), eq("UTF-8"));
            // --- ĐẾN ĐÂY ---

        } else {
            // Kịch bản Thành công:
            doNothing().when(mailSender).send(mockMimeMessage);
        }

        // Act & Assert
        if (expectException) {
            // Test kịch bản lỗi
            ErrorCode expectedErrorCode = ErrorCode.valueOf(expectedErrorCodeString);

            AppException e = assertThrows(AppException.class, () ->
                    emailService.sendEmail(toEmail, template, args)
            );

            assertEquals(expectedErrorCode, e.getErrorCode());

        } else {
            // Test kịch bản thành công
            EmailResponse response = emailService.sendEmail(toEmail, template, args);

            assertNotNull(response);
            assertTrue(response.isSuccess());
            assertEquals(toEmail, response.getTo());
            assertEquals(template.getSubject(), response.getSubject());

            verify(mailSender, times(1)).send(mockMimeMessage);
            verify(template, times(1)).getContent(args);
        }
    }
}