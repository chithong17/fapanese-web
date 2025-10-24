package com.ktnl.fapanese.mail;

import org.springframework.stereotype.Component;

@Component
public class TeacherApprovalEmail extends BaseEmailTemplate {

    @Override
    public String getSubject() {
        return "🎉 Fapanese - Tài khoản giảng viên đã được phê duyệt!";
    }

    @Override
    protected String renderBody(String... args) {
        String fullName = args.length > 0 ? args[0] : "Giảng viên";

        return """
            <h2 style="color:#14a5a5;">Xin chào %s,</h2>
            <p>Chúng tôi vui mừng thông báo rằng tài khoản giảng viên của bạn đã được <b>quản trị viên Fapanese</b> phê duyệt thành công. 🎉</p>
            <p>Bây giờ bạn có thể đăng nhập vào hệ thống và bắt đầu giảng dạy, quản lý khóa học, và tương tác với sinh viên.</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi qua địa chỉ 
               <a href="mailto:fapanese.edu@gmail.com">fapanese.edu@gmail.com</a>.</p>
            <p>Trân trọng,<br/><b>Đội ngũ Fapanese</b></p>
        """.formatted(fullName);
    }
}
