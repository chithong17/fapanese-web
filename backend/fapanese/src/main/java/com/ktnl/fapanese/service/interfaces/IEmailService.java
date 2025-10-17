package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.EmailResponse;
import com.ktnl.fapanese.mail.EmailTemplate;

public interface IEmailService {
    EmailResponse sendEmail(String to, EmailTemplate emailTemplate, String... args);
}
