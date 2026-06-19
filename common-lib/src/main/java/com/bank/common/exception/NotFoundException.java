package com.bank.common.exception;

public class NotFoundException extends CustomException {
    private static final String ERROR_CODE = "NOT_FOUND";

    public NotFoundException() {
        super(ERROR_CODE, "Resource not found");
    }

    public NotFoundException(String message) {
        super(ERROR_CODE, message);
    }
}
