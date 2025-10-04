package com.ktnl.fapanese.mail;

public class VerifyOtpEmail extends BaseEmailTemplate {
    @Override
    public String getSubject() {
        return "Xác thực tài khoản - Mã OTP";
    }

    @Override
    protected String renderBody(String... args) {
        String otp = args[0];

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
                      Xin chào 👋
                    </h2>

                    <p style="font-size:16px;color:#333;line-height:1.6;">
                      Cảm ơn bạn đã đăng ký tài khoản trên
                      <strong style="color:#14a5a5;">Fapanese</strong>.
                    </p>

                    <p style="font-size:16px;color:#333;line-height:1.6;">
                      Đây là mã OTP để xác thực tài khoản của bạn:
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
                      Mã này chỉ có hiệu lực trong
                      <strong>5 phút</strong>.
                      Vui lòng không chia sẻ mã với bất kỳ ai để đảm bảo an toàn cho tài khoản của bạn.
                    </p>

                    <hr style="margin:25px 0;border:none;border-top:1px solid #e0e0e0;">
                  </div>
                </body>

                                """
                .formatted(otp);
    }
}
