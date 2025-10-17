package com.ktnl.fapanese.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

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

    // 👉 Validation specific error codes
    FIRSTNAME_REQUIRED(2001, "First name is required", HttpStatus.BAD_REQUEST),
    LASTNAME_REQUIRED(2002, "Last name is required", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(2003, "Invalid email format", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(2004, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    ROLE_REQUIRED(2005, "Role is required", HttpStatus.BAD_REQUEST),
    DOB_INVALID(2006, "Date of birth must be in the past", HttpStatus.BAD_REQUEST),
    CAMPUS_REQUIRED(2007, "Campus is required", HttpStatus.BAD_REQUEST);



    ;
    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
