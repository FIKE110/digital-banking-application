package com.bank.common.exception;

public class BadRequestException extends CustomException {
    private static final String ERROR_CODE = "BAD_REQUEST";

    public BadRequestException(String message) {
        super(ERROR_CODE, message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(ERROR_CODE, message);
        initCause(cause);
    }
}
