package com.ktnl.fapanese.mail;

public class ForgotPasswordEmail extends BaseEmailTemplate {

    @Override
    public String getSubject() {
        return "Mã OTP đặt lại mật khẩu";
    }

    @Override
    protected String renderBody(String... args) {
        String name = args[0];
        String otpCode = args[1];

        return """
                <head>
                  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
                </head>

                <body style="margin:0;padding:0;background:#f0f0f0;">
                  <div style="max-width:600px;margin:20px auto;padding:20px;
                              font-family:'Nunito',Arial,Helvetica,sans-serif;
                              background:#ffffff;border-radius:10px;
                              border:1px solid #e0e0e0;">

                    <h2 style="color:#14a5a5;text-align:center;margin-bottom:20px;font-weight:700;">
                      Xin chào %s 👋
                    </h2>

                    <p style="font-size:16px;color:#333;line-height:1.6;">
                      Bạn vừa yêu cầu <strong>đặt lại mật khẩu</strong> cho tài khoản của mình trên 
                      <strong style="color:#14a5a5;">Fapanese</strong>.
                    </p>

                    <p style="font-size:16px;color:#333;line-height:1.6;">
                      Đây là mã OTP của bạn (hiệu lực trong <strong>5 phút</strong>):
                    </p>

                    <div style="text-align:center;margin:25px 0;">
                      <span style="display:inline-block;
                                   font-size:28px;
                                   font-weight:700;
                                   color:#ffffff;
                                   background:#14a5a5;
                                   padding:15px 30px;
                                   border-radius:8px;
                                   letter-spacing:6px;">
                        %s
                      </span>
                    </div>

                    <p style="font-size:15px;color:#555;line-height:1.6;">
                      Hãy nhập mã OTP này vào ứng dụng hoặc website để đổi mật khẩu mới.
                      <br>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
                    </p>

                    <hr style="margin:25px 0;border:none;border-top:1px solid #e0e0e0;">

                    <p style="font-size:13px;color:#888;text-align:center;">
                      © 2025 Fapanese — Học tiếng Nhật thông minh cùng AI 🇯🇵
                    </p>
                  </div>
                </body>
                """.formatted(name, otpCode);
    }
}
