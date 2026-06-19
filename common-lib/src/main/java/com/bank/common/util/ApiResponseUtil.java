package com.bank.common.util;

import com.bank.common.wrapper.ApiResponse;
import com.bank.common.wrapper.ErrorResponse;

import java.time.LocalDateTime;
import java.util.List;

public final class ApiResponseUtil {

    private ApiResponseUtil() {}

    public static <T> ApiResponse<T> buildSuccess(T data) {
        return ApiResponse.<T>builder()
                .success("true")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> buildSuccess(String message, T data) {
        return ApiResponse.<T>builder()
                .success("true")
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ErrorResponse buildError(String errorCode, String message, String apiPath) {
        return ErrorResponse.builder()
                .success("false")
                .errorCode(errorCode)
                .message(message)
                .apiPath(apiPath)
                .timestamp(LocalDateTime.now())
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
                .build();
    }
}
