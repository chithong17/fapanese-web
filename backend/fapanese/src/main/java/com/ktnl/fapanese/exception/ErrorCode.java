package com.ktnl.fapanese.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import java.text.MessageFormat;

@Getter
public enum ErrorCode {
    USER_NOT_EXISTED(1000, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    AUTHENTICATED(1001, "Xác thực thất bại", HttpStatus.UNAUTHORIZED),
    INVALID_KEY(8888, "Mã lỗi chưa đặt tên", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(9999, "Đã có lỗi không xác định xảy ra", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_EXISTED(1002, "Email đã tồn tại trong hệ thống", HttpStatus.BAD_REQUEST),
    EMAIL_SENDER(1003, "Gửi Email thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    OTP_NOT_EXISTED(1004, "OTP không tồn tại", HttpStatus.NOT_FOUND),
    OTP_INVALID(1005, "OTP không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    USER_NOT_ISACTIVED(1006, "Tài khoản của bạn đã bị vô hiệu hóa", HttpStatus.FORBIDDEN),
    ROLE_NOT_FOUND(1007, "Không tìm thấy Role của người dùng", HttpStatus.NOT_FOUND),
    USER_NOT_VERIFY_EMAIL(1008, "Tài khoản của bạn chưa xác thực Email", HttpStatus.FORBIDDEN),
    USER_NEED_ADMIN_APPROVAL(1009, "Tài khoản của bạn đang đợi duyệt", HttpStatus.FORBIDDEN),
    COURSE_NOT_FOUND(1010, "Không tìm thấy khóa học", HttpStatus.NOT_FOUND),
    INVALID_COURSE_NAME(1011, "Vui lòng nhập tên hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_INCORRECT(1012, "Mật khẩu cũ không chính xác", HttpStatus.BAD_REQUEST),
    INVALID_INPUT(1012, "Đáp án không hợp lệ", HttpStatus.BAD_REQUEST),
    LESSON_NOT_FOUND(1013, "Không tìm thấy bài học", HttpStatus.NOT_FOUND),
    GRAMMAR_NOT_FOUND(1014, "Không tìm thấy ngữ pháp", HttpStatus.NOT_FOUND),
    VOCABULARY_NOT_FOUND(1014, "Không tìm thấy từ vựng", HttpStatus.NOT_FOUND),
    QUESTION_NOT_FOUND(1014, "Không tìm thấy câu hỏi", HttpStatus.NOT_FOUND),
    LESSON_PART_NOT_FOUND(1014, "Không tìm thấy lesson part", HttpStatus.NOT_FOUND),
    SPEAKING_NOT_FOUND(1014, "Không tìm thấy Speaking", HttpStatus.NOT_FOUND),
    CLASS_NOT_FOUND(1014, "Không tìm thấy Class", HttpStatus.NOT_FOUND),
    LECTURER_NOT_FOUND(1014, "Không tìm thấy Lecturer", HttpStatus.NOT_FOUND),
    MATERIAL_NOT_FOUND(1016, "Không tìm thấy Material", HttpStatus.NOT_FOUND),
    INVALID_CLASS_NAME(1015,"ClassName không hợp lệ", HttpStatus.NOT_FOUND),
    STUDENT_NOT_FOUND(1017,"Student không hợp lệ", HttpStatus.NOT_FOUND),
    SUBMISSION_NOT_FOUND(1018,"Bài nộp không hợp lệ", HttpStatus.NOT_FOUND),
    CLASS_COURSE_NOT_FOUND(1018,"CLASS_COURSE không hợp lệ", HttpStatus.NOT_FOUND),
    // 👉 Validation specific error codes
    FIRSTNAME_REQUIRED(2001, "First name is required", HttpStatus.BAD_REQUEST),
    LASTNAME_REQUIRED(2002, "Last name is required", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(2003, "Invalid email format", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(2004, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    ROLE_REQUIRED(2005, "Role is required", HttpStatus.BAD_REQUEST),
    DOB_INVALID(2006, "Date of birth must be in the past", HttpStatus.BAD_REQUEST),
    CAMPUS_REQUIRED(2007, "Campus is required", HttpStatus.BAD_REQUEST),

    FILE_REQUIRED(3001, "File không được rỗng", HttpStatus.BAD_REQUEST),
    EXCEL_MISSING_HEADER(3002, "File Excel thiếu cột {0}", HttpStatus.BAD_REQUEST),
    INVALID_COLUMN(3003, "Cột {0} không được để trống.", HttpStatus.BAD_REQUEST),
    DOB_FORMAT_INVALID(3004, "Định dạng ngày {0} ở cột {1} không hợp lệ (cần dd/MM/yyyy hoặc yyyy-MM-dd).", HttpStatus.BAD_REQUEST),
    EXCEL_INVALID_DATA_TYPE(3005, "Kiểu dữ liệu ở cột {0} không hợp lệ.", HttpStatus.BAD_REQUEST),
    EXCEL_READ_ERROR(3006, "Lỗi khi đọc ngày tháng ở cột {0}", HttpStatus.BAD_REQUEST), 

    OVERVIEW_PART_NOT_FOUND(4001, "Không tìm thấy Overview Part", HttpStatus.NOT_FOUND),
    EXAM_NOT_FOUND(4002, "Không tìm thấy bài kiểm tra", HttpStatus.NOT_FOUND),
    OVERVIEW_NOT_FOUND(4003, "Không tìm thấy Overview", HttpStatus.NOT_FOUND),
    SPEAKING_QUESTION_NOT_FOUND(4004, "Không tìm thấy Speaking Question", HttpStatus.NOT_FOUND)


    ;


    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    /**
     * Lấy chuỗi message đã được định dạng.
     * @param args Các giá trị cần truyền vào placeholder (ví dụ: {0}, {1}, ...)
     * @return Chuỗi message hoàn chỉnh
     */
    public String getMessage(Object... args) {
        return MessageFormat.format(this.message, args);
    }

    // Bạn cũng có thể thêm một getter cho message gốc nếu cần
    public String getMessageTemplate() {
        return message;
    }
}
