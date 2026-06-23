package com.bank.common.exception;

public class ResourceNotFoundException extends CustomException {
    private static final String ERROR_CODE = "RESOURCE_NOT_FOUND";

    public ResourceNotFoundException(String message) {
        super(ERROR_CODE, message);
    }

    public ResourceNotFoundException(String resource, String field, Object value) {
        super(ERROR_CODE, String.format("%s not found with %s: %s", resource, field, value));
    }
}
