package com.ktnl.fapanese.mail;

public class AccountCreatedEmailTemplate extends BaseEmailTemplate {

    @Override
    protected String renderBody(String... args) {
        // args[0] = email
        // args[1] = password

        String email = args.length > 0 ? args[0] : "your.email@example.com";
        String password = args.length > 1 ? args[1] : "********";
        String fapaneseLink = "https://fapanese-web-upcz.vercel.app/";

        return """
            <h2>Xin chào 👋</h2>
            <p>Chúc mừng! Một tài khoản mới của bạn trên <strong>Fapanese</strong> đã được cấp thành công. 🎉</p>
            
            <p>Dưới đây là thông tin đăng nhập của bạn:</p>
            <ul style="list-style:none; padding-left:0;">
              <li><strong>Email:</strong> %s</li>
              <li><strong>Mật khẩu tạm thời:</strong> 
                <span style="background:#f3f3f3; padding:4px 8px; border-radius:4px; font-family:monospace;">
                  %s
                </span>
              </li>
            </ul>

            <p>Vui lòng nhấn vào nút bên dưới để <strong>đăng nhập</strong> và xác thực địa chỉ email của bạn:</p>

            <p style="text-align:center;">
              <a href="%s" class="button">Đăng nhập & Xác thực Email</a>
            </p>

            <p style="font-size:14px; color:#555;">
              Sau khi đăng nhập, vui lòng đổi mật khẩu của bạn để đảm bảo an toàn tài khoản.<br>
              Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này.
            </p>

            <p style="font-size:13px; color:#777;">
              Trân trọng,<br>
              <strong>Đội ngũ Fapanese</strong>
            </p>
        """.formatted(email, password, fapaneseLink);
    }

    @Override
    public String getSubject() {
        return "Tài khoản Fapanese của bạn đã được cấp";
    }
}
