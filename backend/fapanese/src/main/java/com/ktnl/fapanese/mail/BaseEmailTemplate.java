package com.ktnl.fapanese.mail;

public abstract class BaseEmailTemplate implements EmailTemplate {

    protected abstract String renderBody(String... args);

    @Override
    public String getContent(String... args) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8">
                  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
                  <style>
                    body {
                      font-family: 'Nunito', Arial, Helvetica, sans-serif;
                      background-color: #f9fafb;
                      margin: 0;
                      padding: 0;
                    }
                    .container {
                      max-width: 600px;
                      margin: 30px auto;
                      background: #ffffff;
                      border-radius: 12px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                      overflow: hidden;
                    }
                    .header {
                      background-color: #14a5a5;
                      padding: 25px;
                      text-align: center;
                    }
                    .header img {
                      max-height: 70px;
                      display: block;
                      margin: 0 auto;
                    }
                    .content {
                      padding: 30px;
                      text-align: left;
                    }
                    h2 {
                      color: #222;
                      margin-top: 0;
                      font-weight: 700;
                    }
                    p {
                      font-size: 15px;
                      color: #444;
                      line-height: 1.6;
                    }
                    .button {
                      display: inline-block;
                      margin: 20px 0;
                      padding: 14px 28px;
                      background-color: #ffcc00;
                      color: #222 !important;
                      text-decoration: none;
                      border-radius: 6px;
                      font-weight: 600;
                      box-shadow: 0 2px 5px rgba(0,0,0,0.15);
                      transition: background 0.3s ease;
                    }
                    .button:hover {
                      background-color: #ffb300;
                    }
                    .footer {
                      font-size: 13px;
                      color: #555;
                      padding: 30px;
                      background: #f9fafb;
                      text-align: left;
                    }
                    .footer h3 {
                      font-size: 15px;
                      margin-bottom: 10px;
                      font-weight: 600;
                      color: #222;
                    }
.footer a {
                      color: #14a5a5;
                      text-decoration: none;
                      font-size: 13px;
                    }
                    .footer a:hover {
                      text-decoration: underline;
                    }
                    .footer-section {
                      display: inline-block;
                      vertical-align: top;
                      width: 45%;
                      margin: 10px 2%;
                    }
                    .footer-section img {
                      height: 60px;
                      margin-bottom: 10px;
                    }
                    .social-icons img {
                      height: 28px;
                      width: 28px;
                      margin-right: 10px;
                      vertical-align: middle;
                    }
                    .bottom-footer {
                      text-align: center;
                      font-size: 12px;
                      color: #777;
                      margin-top: 20px;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <!-- Header -->
                    <div class="header">
                      <img src="https://i.postimg.cc/W4JM5xdL/logo.png" alt="Fapanese Logo">
                    </div>

                    <!-- Content -->
                    <div class="content">
                      %s
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                      <div class="footer-section">
                        <img src="https://i.postimg.cc/137kGVqd/logo2.png" alt="Fapanese Logo">
                        <p style="font-size:13px; color:#555;">
                          Học tiếng Nhật thông minh với AI.<br>
                          Lộ trình học tối ưu, dễ hiểu và hiệu quả.
                        </p>
                        <p style="font-size:12px; color:#888;">© 2025 Fapanese. All rights reserved.</p>
                      </div>

                      <div class="footer-section">
                        <h3>Liên hệ</h3>
                        <p>Email: fapanese.edu@gmail.com</p>
                        <p>Hotline: +84 123 456 789</p>
                        <div class="social-icons">
                          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook"></a>
                          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter"></a>
                          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram"></a>
                          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn"></a>
                        </div>
                      </div>

                      <div class="bottom-footer">
Designed with ❤️ by Fapanese Team
                      </div>
                    </div>
                  </div>
                </body>
                </html>
                 """
                .formatted(renderBody(args));
    }
}