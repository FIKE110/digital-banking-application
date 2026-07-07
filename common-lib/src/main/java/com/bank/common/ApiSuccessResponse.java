package com.bank.common;

import java.time.Instant;

public class ApiSuccessResponse<T> {

    private final boolean success = true;
    private final String message;
    private final T data;
    private final Metadata metadata;

    private ApiSuccessResponse(String message, T data, String requestId) {
        this.message = message;
        this.data = data;
        this.metadata = new Metadata(Instant.now().toString(), requestId);
    }

    public static <T> ApiSuccessResponse<T> of(String message, T data, String requestId) {
        return new ApiSuccessResponse<>(message, data, requestId);
    }

    public static <T> ApiSuccessResponse<T> of(String message, T data) {
        return new ApiSuccessResponse<>(message, data, null);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public static class Metadata {
        private final String timestamp;
        private final String requestId;

        public Metadata(String timestamp, String requestId) {
            this.timestamp = timestamp;
            this.requestId = requestId;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public String getRequestId() {
            return requestId;
        }
    }

    @Override
    public String toString() {
        return "ApiSuccessResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", data=" + data +
                ", metadata=" + metadata +
                '}';
    }
}
