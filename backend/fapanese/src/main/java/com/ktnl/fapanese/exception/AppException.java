package com.ktnl.fapanese.exception;

import lombok.Data;

import java.text.MessageFormat;

@Data
public class AppException extends RuntimeException{
    private ErrorCode errorCode;
    private final transient Object[] args;

    public AppException(ErrorCode errorCode, Object... args) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.args = args;
    }

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.args = null; // Không có args
    }


}
