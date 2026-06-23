package com.bank.common.constant;

public final class ErrorConstant {

    private ErrorConstant() {}

    public static final String RESOURCE_NOT_FOUND = "ERR-001";
    public static final String BAD_REQUEST = "ERR-002";
    public static final String DUPLICATE_RESOURCE = "ERR-003";
    public static final String VALIDATION_ERROR = "ERR-004";
    public static final String INTERNAL_SERVER_ERROR = "ERR-005";
    public static final String UNAUTHORIZED = "ERR-006";
    public static final String FORBIDDEN = "ERR-007";
    public static final String METHOD_NOT_ALLOWED = "ERR-008";
    public static final String MEDIA_TYPE_NOT_SUPPORTED = "ERR-009";

    public static final String NOT_FOUND_MSG = "{resource} not found with {field}: {value}";
    public static final String DUPLICATE_MSG = "{resource} already exists with {field}: {value}";
    public static final String VALIDATION_FAILED = "Validation failed for request";
    public static final String INTERNAL_ERROR_MSG = "An unexpected error occurred. Please try again later.";
    public static final String BAD_REQUEST_MSG = "Bad request: {detail}";
}
