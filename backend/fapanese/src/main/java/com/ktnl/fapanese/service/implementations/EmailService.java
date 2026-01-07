package com.ktnl.fapanese.service.implementations;

import com.ktnl.fapanese.dto.response.EmailResponse;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mail.EmailTemplate;
import com.ktnl.fapanese.service.interfaces.IEmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// Import thư viện SendGrid
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService implements IEmailService {

    // Không cần JavaMailSender nữa

    @NonFinal
    @Value("${spring.mail.username}")
    private String fromEmail; // Email gửi đi (phải được xác thực trên SendGrid)

    @NonFinal
    @Value("${sendgrid.api.key}") // Đọc API Key từ biến môi trường Railway
    private String sendGridApiKey;


    /**
     * Gửi email tới người nhận (Đã được viết lại để dùng SendGrid API)
     */
    @Override
    public EmailResponse sendEmail(String to, EmailTemplate emailTemplate, String... args) {

        // 1. Chuẩn bị các đối tượng SendGrid
        Email from = new Email(fromEmail);
        Email toEmail = new Email(to);
        String subject = emailTemplate.getSubject();
        // Lấy nội dung HTML từ template của bạn
        String htmlContent = emailTemplate.getContent(args);
        Content content = new Content("text/html", htmlContent);

        // Tạo đối tượng Mail
        Mail mail = new Mail(from, subject, toEmail, content);

        // 2. Tạo client SendGrid
        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            // 3. Cấu hình và gửi request API
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            // Gửi
            Response response = sg.api(request);

            // 4. Kiểm tra kết quả
            // Mã 2xx (ví dụ 202 Accepted) có nghĩa là SendGrid đã nhận email thành công
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                log.info("SendGrid mail sent to " + to + ". Status code: " + response.getStatusCode());
            } else {
                // Nếu SendGrid báo lỗi (ví dụ 4xx, 5xx)
                log.error("Failed to send mail via SendGrid. Status: " + response.getStatusCode());
                log.error("SendGrid response body: " + response.getBody());
                throw new AppException(ErrorCode.EMAIL_SENDER);
            }

        } catch (IOException e) {
            // Trường hợp có lỗi mạng (không kết nối được tới API của SendGrid)
            e.printStackTrace();
            log.error("IOException when sending mail: " + e.getMessage());
            throw new AppException(ErrorCode.EMAIL_SENDER);
        }

        // Trả về response thành công
        return EmailResponse.builder()
                .to(to)
                .subject(subject)
                .isSuccess(true)
                .build();
    }
}