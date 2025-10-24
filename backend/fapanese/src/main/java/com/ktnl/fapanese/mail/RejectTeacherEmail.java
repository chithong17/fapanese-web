package com.ktnl.fapanese.mail;

import org.springframework.stereotype.Component;

@Component
public class RejectTeacherEmail extends BaseEmailTemplate {

    @Override
    public String getSubject() {
        return "⚠️ Fapanese - Yêu cầu giảng viên chưa được phê duyệt";
    }

    @Override
    protected String renderBody(String... args) {
        String fullName = args.length > 0 ? args[0] : "Giảng viên";

        return """
            <h2 style="color:#e74c3c;">Xin chào %s,</h2>
            <p>Rất tiếc, yêu cầu đăng ký tài khoản giảng viên của bạn hiện <b>chưa được phê duyệt</b>.</p>
            <p>Nguyên nhân có thể là thông tin hồ sơ chưa đầy đủ hoặc chưa đáp ứng các tiêu chí giảng dạy của hệ thống <b>Fapanese</b>.</p>
            <p>Bạn có thể chỉnh sửa hồ sơ và gửi lại yêu cầu trong tương lai.</p>
            <p>Nếu bạn cần hỗ trợ hoặc muốn trao đổi thêm, vui lòng liên hệ với quản trị viên qua địa chỉ 
               <a href="mailto:fapanese.edu@gmail.com">fapanese.edu@gmail.com</a>.</p>
            <p>Trân trọng,<br/><b>Đội ngũ Fapanese</b></p>
        """.formatted(fullName);
    }
}
