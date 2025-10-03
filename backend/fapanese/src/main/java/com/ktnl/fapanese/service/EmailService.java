package com.ktnl.fapanese.service;

import com.ktnl.fapanese.dto.response.EmailResponse;
import com.ktnl.fapanese.exception.AppException;
import com.ktnl.fapanese.exception.ErrorCode;
import com.ktnl.fapanese.mail.EmailTemplate;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {
    JavaMailSender mailSender; // Spring cung cấp để gửi mail

    @NonFinal
    @Value("${spring.mail.username}")
    private String from;               // Email gửi đi


    /**
     * Gửi email tới người nhận
     *
     * @param to:              Địa chỉ email của người nhận
     * @param emailTemplate:   Template email (enum EmailTemplate định nghĩa subject + content)
     * @param args:            Tham số truyền vào template để format nội dung động
     *
     * VD:
     * sendEmail("user@gmail.com", EmailTemplate.CONFIRM_REGISTER, "Nguyễn Văn A", "http://link-active")
     *  -> "args[0] = Nguyễn Văn A", "args[1] = link-active"
     *  -> emailTemplate sẽ dùng args để replace placeholder trong nội dung
     */
    public EmailResponse sendEmail(String to, EmailTemplate emailTemplate, String... args){
        try {
            // 1. Tạo MimeMessage (email phức tạp, hỗ trợ HTML, file đính kèm...)
            MimeMessage message = mailSender.createMimeMessage();
            // 2. Dùng MimeMessageHelper để set thông tin mail
            //    - true = cho phép gửi mail có nội dung HTML hoặc multipart
            //    - UTF-8 = mã hóa ký tự để hiển thị đúng tiếng Việt
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // 3. Gán thông tin cơ bản
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(emailTemplate.getSubject());
            helper.setText(emailTemplate.getContent(args), true); // true = HTML

            // 4. Gửi mail
            mailSender.send(message);
            log.info("Mail sent to " + to);

        } catch (MessagingException e) {
            // Trường hợp có lỗi khi tạo / gửi email
            e.printStackTrace();
            log.info("Failed to send mail");
            throw new AppException(ErrorCode.EMAIL_SENDER);
        }

        return EmailResponse.builder()
                .to(to)
                .subject(emailTemplate.getSubject())
                .isSuccess(true)
                .build();
    }
}
