package com.bank.common.constant;

public final class MessageConstant {

    private MessageConstant() {}

    // =========================
    // AUTH MESSAGES
    // =========================
    public static final String LOGIN_SUCCESS = "Login successful";
    public static final String LOGIN_FAILED = "Invalid credentials";
    public static final String LOGOUT_SUCCESS = "Logout successful";
    public static final String TOKEN_EXPIRED = "Token has expired";
    public static final String TOKEN_INVALID = "Invalid token";

    // =========================
    // USER MESSAGES
    // =========================
    public static final String USER_CREATED = "User created successfully";
    public static final String USER_UPDATED = "User updated successfully";
    public static final String USER_NOT_FOUND = "User not found";
    public static final String USER_ALREADY_EXISTS = "User already exists";

    // =========================
    // WALLET MESSAGES
    // =========================
    public static final String WALLET_CREATED = "Wallet created successfully";
    public static final String WALLET_NOT_FOUND = "Wallet not found";
    public static final String WALLET_FUND_SUCCESS = "Wallet funded successfully";
    public static final String WALLET_DEBIT_SUCCESS = "Wallet debited successfully";
    public static final String INSUFFICIENT_FUNDS = "Insufficient balance";

    // =========================
    // TRANSACTION MESSAGES
    // =========================
    public static final String TRANSACTION_SUCCESS = "Transaction completed successfully";
    public static final String TRANSACTION_FAILED = "Transaction failed";
    public static final String TRANSACTION_PENDING = "Transaction is pending";
    public static final String DUPLICATE_TRANSACTION = "Duplicate transaction detected";

    // =========================
    // VALIDATION MESSAGES
    // =========================
    public static final String VALIDATION_ERROR = "Validation error";
    public static final String INVALID_REQUEST = "Invalid request payload";
    public static final String MISSING_FIELD = "Required field is missing";

    // =========================
    // SYSTEM MESSAGES
    // =========================
    public static final String INTERNAL_ERROR = "Internal server error";
    public static final String SERVICE_UNAVAILABLE = "Service temporarily unavailable";
    public static final String SUCCESS = "Request completed successfully";
}
