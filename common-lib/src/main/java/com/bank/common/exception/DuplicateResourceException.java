package com.bank.common.exception;

public class DuplicateResourceException extends CustomException {
    private static final String ERROR_CODE = "DUPLICATE_RESOURCE";

    public DuplicateResourceException(String message) {
        super(ERROR_CODE, message);
    }

    public DuplicateResourceException(String resource, String field, Object value) {
        super(ERROR_CODE, String.format("%s already exists with %s: %s", resource, field, value));
    }
}
