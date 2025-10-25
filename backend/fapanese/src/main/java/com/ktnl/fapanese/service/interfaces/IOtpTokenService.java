package com.ktnl.fapanese.service.interfaces;

import com.ktnl.fapanese.dto.response.EmailResponse;
import com.ktnl.fapanese.dto.response.VerifyOtpResponse;
import com.ktnl.fapanese.mail.EmailTemplate;

public interface IOtpTokenService {
    EmailResponse generateAndSendOtp(String email, EmailTemplate template, String... args);
    VerifyOtpResponse verifyOtp(String email, String otpInput);
}
