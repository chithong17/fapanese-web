package com.ktnl.fapanese.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    USER_NOT_EXISTED(1000, "User is not existed", HttpStatus.NOT_FOUND),
    AUTHENTICATED(1001, "Authenticate fail", HttpStatus.UNAUTHORIZED),
    INVALID_KEY(8888, "Invalid message key", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized excetion", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_EXISTED(1002, "Email is existed", HttpStatus.BAD_REQUEST),
    EMAIL_SENDER(1003, "Send email failed", HttpStatus.INTERNAL_SERVER_ERROR),
    OTP_NOT_EXISTED(1004, "OTP is not existed", HttpStatus.NOT_FOUND),
    OTP_INVALID(1005, "OTP is invalid or expiry", HttpStatus.BAD_REQUEST),
    USER_NOT_ISACTIVED(1006, "User is not actived", HttpStatus.FORBIDDEN),
    ROLE_NOT_FOUND(1007, "Role not found", HttpStatus.NOT_FOUND),

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
