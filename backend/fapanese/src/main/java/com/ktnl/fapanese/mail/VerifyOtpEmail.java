package com.ktnl.fapanese.mail;

public class VerifyOtpEmail extends BaseEmailTemplate{
    @Override
    public String getSubject() {
        return "Xác thực tài khoản - Mã OTP";
    }

    @Override
    protected String renderBody(String... args) {
        String otp = args[0];

        return """
                <h2>Xin chào,</h2>
                <p>Bạn vừa đăng ký tài khoản trên <strong>Fapanese</strong>.</p>
                <p>Đây là mã OTP của bạn:</p>
                <h2 style="color:#14a5a5; letter-spacing:3px;">%s</h2>
                <p>Mã này chỉ có hiệu lực trong <strong>5 phút</strong>. Vui lòng không chia sẻ với bất kỳ ai.</p>
                """.formatted(otp);
    }
}
