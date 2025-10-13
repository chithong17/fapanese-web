package com.ktnl.fapanese.controller;

import com.ktnl.fapanese.mail.ForgotPasswordEmail;
import com.ktnl.fapanese.service.interfaces.IEmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/test-mail")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MailTestController {
    IEmailService iEmailService;

    @GetMapping
    public String sendTestMail() {
        String subject = "🔔 Test gửi mail từ Spring Boot";
        String content = "<h2>Xin chào!</h2><p>Email test gửi bằng Spring Boot 🚀</p>";

        iEmailService.sendEmail("hlqkhanh@gmail.com", new ForgotPasswordEmail(), "Nguyễn Văn A", "http://localhost:8080/reset?token=xyz789");
        return "Đã gửi mail đến: " + "hlqkhanh@gmail.com";
    }

}

