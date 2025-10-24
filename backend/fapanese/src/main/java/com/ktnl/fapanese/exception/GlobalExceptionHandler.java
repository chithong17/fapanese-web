package com.ktnl.fapanese.exception;

import com.ktnl.fapanese.dto.response.ApiResponse;
import com.ktnl.fapanese.dto.response.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice   // Đánh dấu class này là global exception handler (xử lý lỗi toàn cục cho Spring MVC)
public class GlobalExceptionHandler {

    /**
     * Handler cho AppException (custom exception của hệ thống)
     */
    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingAppException(AppException exception){
        ErrorCode errorCode = exception.getErrorCode(); // lấy errorCode được ném từ exception
        Object[] args = exception.getArgs();

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(mapErrorCodeMessage(errorCode.getMessage(), args));


        return ResponseEntity
                .status(errorCode.getStatusCode()) // trả về đúng HTTP status tương ứng
                .body(apiResponse);
    }

    private String mapErrorCodeMessage(String messageTemplate, Object... args){
        // Nếu không có args, trả về template gốc
        if (args == null || args.length == 0) {
            return messageTemplate;
        }

        // Dùng MessageFormat để chèn args vào template
        return MessageFormat.format(messageTemplate, args);
    }


    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse> handlerRuntimeException(RuntimeException re){
        ApiResponse apiResponse = new ApiResponse();
        log.info(re.getMessage());

        // In thêm full stacktrace
        log.error("Unhandled exception", re);
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }

    /**
     * Handler cho lỗi validate (javax/jakarta validation)
     * Ví dụ: @Size(min=6) -> nếu vi phạm thì exception này sẽ được ném
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            ErrorCode code = mapFieldToErrorCode(fieldError.getField());
            errors.put(fieldError.getField(), Map.of(
                    "code", code.getCode(),
                    "message", fieldError.getDefaultMessage()
            ));
        }

        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                errors
        );

        return ResponseEntity.badRequest().body(response);
    }

    private ErrorCode mapFieldToErrorCode(String field) {
        return switch (field) {
            case "firstName" -> ErrorCode.FIRSTNAME_REQUIRED;
            case "lastName" -> ErrorCode.LASTNAME_REQUIRED;
            case "email" -> ErrorCode.EMAIL_INVALID;
            case "password" -> ErrorCode.PASSWORD_INVALID;
            case "role" -> ErrorCode.ROLE_REQUIRED;
            case "dateOfBirth" -> ErrorCode.DOB_INVALID;
         //   case "campus" -> ErrorCode.CAMPUS_REQUIRED;
            default -> ErrorCode.INVALID_KEY; // fallback
        };
    }
}
