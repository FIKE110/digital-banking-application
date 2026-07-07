package com.bank.common;


public class ApiErrorResponse {

    private final boolean success = false;
    private final String message;
    private final ErrorDetail error;

    private ApiErrorResponse(String message, String code, String requestId, Object details) {
        this.message = message;
        this.error = new ErrorDetail(code, requestId, details);
    }

    public static ApiErrorResponse of(String message, String code, String requestId, Object details) {
        return new ApiErrorResponse(message, code, requestId, details);
    }

    public static ApiErrorResponse of(String message, String code, String requestId) {
        return new ApiErrorResponse(message, code, requestId, null);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public ErrorDetail getError() {
        return error;
    }

    public static class ErrorDetail {
        private final String code;
        private final String requestId;
        private final Object details;

        public ErrorDetail(String code, String requestId, Object details) {
            this.code = code;
            this.requestId = requestId;
            this.details = details;
        }

        public String getCode() {
            return code;
        }

        public String getRequestId() {
            return requestId;
        }

        public Object getDetails() {
            return details;
        }
    }

    @Override
    public String toString() {
        return "ApiErrorResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", error=" + error +
                '}';
    }
}