package com.ktnl.fapanese.mail;

public class ForgotPasswordEmail extends BaseEmailTemplate {

    @Override
    public String getSubject() {
        return "Đặt lại mật khẩu";
    }

    @Override
    protected String renderBody(String... args) {
        String name = args[0];
        String resetLink = args[1];

        return """
                <h2>Xin chào %s,</h2>
                <p>Bạn vừa yêu cầu <strong>đặt lại mật khẩu</strong> cho tài khoản của mình.</p>
                <p>Vui lòng click vào nút bên dưới để tạo mật khẩu mới:</p>
                <a href="%s" class="button">Đặt lại mật khẩu</a>
                <p>Nếu không phải bạn, vui lòng bỏ qua email này.</p>
                """.formatted(name, resetLink);
    }
}
