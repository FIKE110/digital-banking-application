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
    public static final String TOKEN_INCORRECT = "Invalid token";
    public static final String TOKEN_REFRESHED = "Token refreshed";
    public static final String OTP_SENT = "OTP sent successfully";
    public static final String PASSWORD_RESET = "Password reset successfully";

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
    // LEDGER MESSAGES
    // =========================
    public static final String TRANSACTIONS_FETCHED = "Transactions fetched successfully";
    public static final String TRANSACTION_FETCHED = "Transaction fetched successfully";
    public static final String LEDGER_ENTRIES_FETCHED = "Ledger entries fetched successfully";

    // =========================
    // TRANSFER MESSAGES
    // =========================
    public static final String TRANSFER_COMPLETED = "Transfer completed successfully";
    public static final String TRANSFER_REVERSED = "Transfer reversed successfully";
    public static final String TRANSFER_FETCHED = "Transfer fetched successfully";
    public static final String TRANSFERS_FETCHED = "Transfers fetched successfully";
    public static final String TRANSFER_NOT_FOUND = "Transfer not found";
    public static final String INSUFFICIENT_BALANCE = "Insufficient balance";
    public static final String SAME_ACCOUNT_TRANSFER = "Cannot transfer to the same account";

    // =========================
    // VALIDATION MESSAGES
    // =========================
    public static final String VALIDATION_ERROR = "Validation error";
    public static final String INVALID_REQUEST = "Invalid request payload";
    public static final String MISSING_FIELD = "Required field is missing";

    // =========================
    // ACCOUNT MESSAGES
    // =========================
    public static final String ACCOUNT_CREATED = "Account created successfully";
    public static final String ACCOUNT_FETCHED = "Account fetched successfully";
    public static final String ACCOUNTS_FETCHED = "Accounts fetched successfully";
    public static final String BALANCE_FETCHED = "Balance fetched successfully";
    public static final String ACCOUNT_STATUS_UPDATED = "Account status updated successfully";
    public static final String ACCOUNT_NOT_FOUND = "Account not found";

    // =========================
    // SYSTEM MESSAGES
    // =========================
    public static final String INTERNAL_ERROR = "Internal server error";
    public static final String SERVICE_UNAVAILABLE = "Service temporarily unavailable";
    public static final String SUCCESS = "Request completed successfully";

    // =========================
    // PROFILE MESSAGES
    // =========================
    public static final String PROFILE_FETCHED = "Profile fetched successfully";
    public static final String PROFILE_UPDATED = "Profile updated successfully";
    public static final String PASSWORD_CHANGED = "Password changed successfully";
    public static final String EMAIL_CHANGED = "Email changed successfully";
    public static final String CURRENT_PASSWORD_INCORRECT = "Current password is incorrect";

    // =========================
    // ADMIN MESSAGES
    // =========================
    public static final String ADMIN_ACCOUNTS_FETCHED = "Admin accounts fetched successfully";
    public static final String ADMIN_ACCOUNT_STATUS_UPDATED = "Account status updated successfully";
    public static final String LIMITS_UPDATED = "Limits updated successfully";
    public static final String AUDIT_LOGS_FETCHED = "Audit logs fetched successfully";
}
