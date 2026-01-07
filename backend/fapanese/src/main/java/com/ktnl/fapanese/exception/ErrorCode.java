package com.ktnl.fapanese.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import java.text.MessageFormat;

@Getter
public enum ErrorCode {

    //Auth 1xxx
    AUTHENTICATED(1001, "Xác thực thất bại", HttpStatus.UNAUTHORIZED),
    USER_NOT_ISACTIVED(1002, "Tài khoản của bạn đã bị vô hiệu hóa", HttpStatus.FORBIDDEN),
    USER_NOT_VERIFY_EMAIL(1003, "Tài khoản của bạn chưa xác thực Email", HttpStatus.FORBIDDEN),
    USER_NEED_ADMIN_APPROVAL(1004, "Tài khoản của bạn đang đợi duyệt", HttpStatus.FORBIDDEN),
    PASSWORD_INCORRECT(1005, "Mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    LOGIN_FAIL(1006, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    AUTHORIZATION_DENY(1007, "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    EXPIRED_SESSION(1008, "Phiên đăng nhập đã hết hạn", HttpStatus.UNAUTHORIZED),
    TOKEN_REUSED(1009, "Refresh Token đã được sử dụng", HttpStatus.FORBIDDEN),
    OTP_NOT_EXISTED(1010, "OTP không tồn tại", HttpStatus.NOT_FOUND),
    OTP_INVALID(1011, "OTP không hợp lệ hoặc đã hết hạn", HttpStatus.BAD_REQUEST),


    //User 2xxx
    USER_NOT_EXISTED(2001, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    EMAIL_EXISTED(2002, "Email đã tồn tại trong hệ thống", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(2003, "Không tìm thấy Role của người dùng", HttpStatus.NOT_FOUND),
    LECTURER_NOT_FOUND(2004, "Không tìm thấy giảng viên", HttpStatus.NOT_FOUND),
    STUDENT_NOT_FOUND(2005,"Không tìm thấy học sinh", HttpStatus.NOT_FOUND),

    //Course 3xxx
    COURSE_NOT_FOUND(3001, "Không tìm thấy khóa học", HttpStatus.NOT_FOUND),
    INVALID_COURSE_NAME(3002, "Tên khóa học không hợp lệ", HttpStatus.BAD_REQUEST),

    //Lesson 4xxx
    LESSON_NOT_FOUND(4001, "Không tìm thấy bài học", HttpStatus.NOT_FOUND),
    GRAMMAR_NOT_FOUND(4002, "Không tìm thấy ngữ pháp", HttpStatus.NOT_FOUND),
    VOCABULARY_NOT_FOUND(4003, "Không tìm thấy từ vựng", HttpStatus.NOT_FOUND),
    LESSON_PART_NOT_FOUND(4004, "Không tìm thấy lesson part", HttpStatus.NOT_FOUND),
    LESSON_PART_INVALID(4005, "Không tìm thấy lesson part", HttpStatus.BAD_REQUEST),


    //Overview 5xxx
    OVERVIEW_NOT_FOUND(5001, "Không tìm thấy Overview", HttpStatus.NOT_FOUND),
    OVERVIEW_PART_NOT_FOUND(5002, "Không tìm thấy Overview Part", HttpStatus.NOT_FOUND),
    EXAM_NOT_FOUND(5003, "Không tìm thấy bài kiểm tra", HttpStatus.NOT_FOUND),
    SPEAKING_QUESTION_NOT_FOUND(5004, "Không tìm thấy Speaking Question", HttpStatus.NOT_FOUND),
    INVALID_ANSWER(5005, "Đáp án không hợp lệ", HttpStatus.BAD_REQUEST),
    QUESTION_NOT_FOUND(5006, "Không tìm thấy câu hỏi", HttpStatus.NOT_FOUND),
    SPEAKING_NOT_FOUND(5007, "Không tìm thấy Speaking", HttpStatus.NOT_FOUND),


    //Class 6xxx
    CLASS_NOT_FOUND(6001, "Không tìm thấy Class", HttpStatus.NOT_FOUND),
    INVALID_CLASS_NAME(6002,"ClassName không hợp lệ", HttpStatus.NOT_FOUND),
    STUDENT_ALREADY_IN_CLASS(6003, "Học sinh đã có trong lớp", HttpStatus.NOT_FOUND),

    //Material 7xxx
    MATERIAL_NOT_FOUND(7001, "Không tìm thấy Material", HttpStatus.NOT_FOUND),
    ClASS_MATERIALS_NOT_FOUND(7002, "Không tìm thấy Class Material", HttpStatus.NOT_FOUND),
    SUBMISSION_NOT_FOUND(7003,"Bài nộp không hợp lệ", HttpStatus.NOT_FOUND),
    ACTION_NOT_ALLOWED(7004, "Material is not submittable", HttpStatus.FORBIDDEN),
    ASSIGNMENT_NOT_FOUND(7005, "Không tìm thấy bài tập", HttpStatus.BAD_REQUEST),

    //File 8xxx
    FILE_REQUIRED(8001, "File không được rỗng", HttpStatus.BAD_REQUEST),
    EXCEL_MISSING_HEADER(8002, "File Excel thiếu cột {0}", HttpStatus.BAD_REQUEST),
    INVALID_COLUMN(8003, "Cột {0} không được để trống.", HttpStatus.BAD_REQUEST),
    DOB_FORMAT_INVALID(8004, "Định dạng ngày {0} ở cột {1} không hợp lệ (cần dd/MM/yyyy hoặc yyyy-MM-dd).", HttpStatus.BAD_REQUEST),
    EXCEL_INVALID_DATA_TYPE(8005, "Kiểu dữ liệu ở cột {0} không hợp lệ.", HttpStatus.BAD_REQUEST),
    EXCEL_READ_ERROR(8006, "Lỗi khi đọc ngày tháng ở cột {0}", HttpStatus.BAD_REQUEST),
    FILE_DELETE_FAIL(8007, "Đã có lỗi xảy ra khi xóa file ở Cloudinary", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_UPLOAD_FAILED(8008, "Lỗi khi upload file lên Cloudinary", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_SIZE_EXCEED(8009, "File đã vượt quá kích cỡ", HttpStatus.BAD_REQUEST),
    FILE_FORMAT_INVALID(8010, "File không được rỗng", HttpStatus.BAD_REQUEST),


    //Other 11xxx, xxxxx
    EMAIL_SENDER(11001, "Gửi Email thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_INPUT(11002, "Input không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_KEY(88888, "Mã lỗi chưa đặt tên", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(99999, "Đã có lỗi không xác định xảy ra", HttpStatus.INTERNAL_SERVER_ERROR),



    // 👉 Validation specific error codes
    FIRSTNAME_REQUIRED(2001, "First name is required", HttpStatus.BAD_REQUEST),
    LASTNAME_REQUIRED(2002, "Last name is required", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(2003, "Invalid email format", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(2004, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    ROLE_REQUIRED(2005, "Role is required", HttpStatus.BAD_REQUEST),
    DOB_INVALID(2006, "Date of birth must be in the past", HttpStatus.BAD_REQUEST),
    CAMPUS_REQUIRED(2007, "Campus is required", HttpStatus.BAD_REQUEST),





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
