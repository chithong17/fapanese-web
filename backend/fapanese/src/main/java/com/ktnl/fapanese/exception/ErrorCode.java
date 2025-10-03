package com.ktnl.fapanese.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    USER_NOT_EXISTED(1000, "User is not existed", HttpStatus.NOT_FOUND),
    AUTHENTICATED(1001, "Authenticate fail", HttpStatus.UNAUTHORIZED),
    UNCATEGORIZED_EXCEPTION(0000, "Uncategorized excetion", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_EXISTED(1002, "Email is existed", HttpStatus.BAD_REQUEST),
    EMAIL_SENDER(1003, "Send email failed", HttpStatus.INTERNAL_SERVER_ERROR),
    OTP_NOT_EXISTED(1004, "OTP is not existed", HttpStatus.NOT_FOUND),
    OTP_INVALID(1005, "OTP is invalid or expiry", HttpStatus.BAD_REQUEST)
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
