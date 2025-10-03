package com.ktnl.fapanese.service;

import com.ktnl.fapanese.entity.OtpToken;
import com.ktnl.fapanese.mail.VerifyOtpEmail;
import com.ktnl.fapanese.repository.OtpTokenRepository;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpTokenService {
    @Autowired
    private final OtpTokenRepository otpRepo;
    @Autowired
    private final EmailService emailService;


    public void generateAndSendOtp(String email) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        OtpToken token = OtpToken.builder()
                .email(email)
                .otpCode(otp)
                .expiryTime(expiry)
                .build();
        otpRepo.save(token);

        // Gửi OTP
        emailService.sendEmail(email, new VerifyOtpEmail(), otp);
    }

    public boolean verifyOtp(String email, String otpInput) {
        Optional<OtpToken> otpTokenOpt = otpRepo.findTopByEmailOrderByExpiryTimeDesc(email);

        if (otpTokenOpt.isEmpty())
            return false;

        OtpToken token = otpTokenOpt.get();
        if (!token.isUsed()
                && token.getOtpCode().equals(otpInput)
                && token.getExpiryTime().isAfter(LocalDateTime.now())) {
            token.setUsed(true);
            otpRepo.save(token);
            return true;
        }
        return false;
    }
}
