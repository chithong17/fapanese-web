package com.ktnl.fapanese.controllerTest;

import com.ktnl.fapanese.mail.ForgotPasswordEmail;
import com.ktnl.fapanese.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/test-mail")
public class MailTestController {
    private final EmailService emailService;

    @GetMapping
    public String sendTestMail() {
        String subject = "🔔 Test gửi mail từ Spring Boot";
        String content = "<h2>Xin chào!</h2><p>Email test gửi bằng Spring Boot 🚀</p>";

        emailService.sendEmail("hlqkhanh@gmail.com", new ForgotPasswordEmail(), "Nguyễn Văn A", "http://localhost:8080/reset?token=xyz789");
        return "Đã gửi mail đến: " + "hlqkhanh@gmail.com";
    }

}

