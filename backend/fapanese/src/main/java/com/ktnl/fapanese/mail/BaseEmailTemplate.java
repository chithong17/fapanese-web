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
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f9fafb;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 30px auto;
                            background: #ffffff;
                            border-radius: 12px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }
                        .header {
                            background-color: #14a5a5;
                            padding: 20px;
                            text-align: center;
                        }
                        .header img {
                            max-height: 60px;
                            display: block;
                            margin: 0 auto;
                        }
                        .content {
                            padding: 30px;
                        }
                        h2 {
                            color: #222222;
                            margin-top: 0;
                        }
                        p {
                            font-size: 15px;
                            color: #555555;
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
                            font-weight: bold;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.15);
                            transition: background 0.3s ease;
                        }
                        .button:hover {
                            background-color: #ffb300;
                        }
                        .footer {
                            font-size: 12px;
                            color: #777777;
                            padding: 15px;
                            text-align: center;
                            background: #f1f3f5;
                        }
                        .footer img {
                            height: 16px;
                            vertical-align: middle;
                            margin: 0 3px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://i.ibb.co/3shCwzp/fapanese-logo.png" alt="Fapanese Logo">
                        </div>
                        <div class="content">
                            %s
                        </div>
                        <div class="footer">
                            &copy; 2025 Fapanese. All rights reserved.<br>
                            Made with ❤️ Việt Nam & Nhật Bản <br>
                            <img src="https://en.wikipedia.org/wiki/File:Flag_of_Japan.svg" alt="VN Flag">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" alt="JP Flag"><br>
                            Đây là email tự động, vui lòng không trả lời.
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(renderBody(args));
    }
}
