package com.ktnl.fapanese.exception;

import com.ktnl.fapanese.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice   // Đánh dấu class này là global exception handler (xử lý lỗi toàn cục cho Spring MVC)
public class GlobalExceptionHandler {

    /**
     * Handler cho AppException (custom exception của hệ thống)
     */
    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingAppException(AppException exception){
        ErrorCode errorCode = exception.getErrorCode(); // lấy errorCode được ném từ exception

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());


        return ResponseEntity
                .status(errorCode.getStatusCode()) // trả về đúng HTTP status tương ứng
                .body(apiResponse);
    }


    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse> handlerRuntimeException(RuntimeException re){
        ApiResponse apiResponse = new ApiResponse();
        log.info(re.getMessage());

        // In thêm full stacktrace
        log.error("Unhandled exception", re);
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }
}
