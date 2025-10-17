package com.ktnl.fapanese.mail;

public class ForgotPasswordEmail extends BaseEmailTemplate {

    @Override
    public String getSubject() {
        return "Mã OTP đặt lại mật khẩu";
    }

    @Override
    protected String renderBody(String... args) {
        String name = args[0];
        String otpCode = args[1]; // thay resetLink bằng OTP

        return """
                <h2>Xin chào %s,</h2>
                <p>Bạn vừa yêu cầu <strong>đặt lại mật khẩu</strong> cho tài khoản của mình.</p>
                <p>Đây là mã OTP của bạn (có hiệu lực trong 5 phút):</p>
                <h3 style="color: #14a5a5; font-size: 24px;">%s</h3>
                <p>Hãy nhập mã này vào ứng dụng/web để đổi mật khẩu mới.</p>
                <p>Nếu không phải bạn, vui lòng bỏ qua email này.</p>
                """.formatted(name, otpCode);
    }
}
