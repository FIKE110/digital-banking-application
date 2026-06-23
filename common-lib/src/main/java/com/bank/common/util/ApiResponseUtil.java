package com.bank.common.util;

import com.bank.common.wrapper.ApiResponse;
import com.bank.common.wrapper.ErrorResponse;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static com.bank.common.constant.StringConstant.REQUEST_ID;

public final class ApiResponseUtil {

    private ApiResponseUtil() {}

    public static <T> ResponseEntity<ApiResponse<T>> buildSuccess(T data) {
        return ResponseEntity.ok(ApiResponse.<T>builder()
                .success("true")
                .data(data)
                .requestId(MDC.get(REQUEST_ID))
                .timestamp(LocalDateTime.now())
                .build());
    }

    public static <T> ResponseEntity<ApiResponse<T>> buildSuccess(String message, T data) {
        return ResponseEntity.ok(ApiResponse.<T>builder()
                .success("true")
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .requestId(MDC.get(REQUEST_ID))
                .build());
    }

    public static <T> ResponseEntity<ApiResponse<T>> buildSuccess(int status,String message, T data) {
        return ResponseEntity.status(status).body(ApiResponse.<T>builder()
                .success("true")
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .requestId(MDC.get(REQUEST_ID))
                .build());
    }


    public static ErrorResponse buildError(String errorCode, String message, String apiPath) {
        return ErrorResponse.builder()
                .success("false")
                .errorCode(errorCode)
                .message(message)
                .apiPath(apiPath)
                .timestamp(LocalDateTime.now())
                .requestId(MDC.get(REQUEST_ID))
                .build();
    }

    public static ErrorResponse buildError(String errorCode, String message, String apiPath, List<String> details) {
        return ErrorResponse.builder()
                .success("false")
                .errorCode(errorCode)
                .message(message)
                .apiPath(apiPath)
                .details(details)
                .timestamp(LocalDateTime.now())
                .requestId(MDC.get(REQUEST_ID))
                .build();
    }
}
