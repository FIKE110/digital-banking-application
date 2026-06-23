package com.bank.common.constant;

public final class ApiConstant {

    private ApiConstant() {}

    public static final String API_BASE_PATH = "/api";
    public static final String API_V1_PATH = API_BASE_PATH+"/v1";


    public static final String DOC_BASE_PATH = "/docs";

    // -- Auth --
    public static final String AUTH_BASE = "/auth";
    public static final String AUTH_REGISTER = AUTH_BASE + "/register";
    public static final String AUTH_LOGIN = AUTH_BASE + "/login";
    public static final String AUTH_REFRESH = AUTH_BASE + "/refresh";
    public static final String AUTH_LOGOUT = AUTH_BASE + "/logout";
    public static final String AUTH_FORGOT_PASSWORD = AUTH_BASE + "/forgot-password";
    public static final String AUTH_RESET_PASSWORD = AUTH_BASE + "/reset-password";
    public static final String AUTH_ME = AUTH_BASE + "/me";

    // -- Accounts --
    public static final String ACCOUNT_BASE = "/accounts";
    public static final String ACCOUNT_ID = ACCOUNT_BASE + "/{id}";
    public static final String ACCOUNT_BALANCE = ACCOUNT_BASE + "/{id}/balance";
    public static final String ACCOUNT_STATUS = ACCOUNT_BASE + "/{id}/status";

    // -- Transfers --
    public static final String TRANSFER_BASE = "/transfers";
    public static final String TRANSFER_ID = TRANSFER_BASE + "/{id}";
    public static final String TRANSFER_REVERSE = TRANSFER_BASE + "/{id}/reverse";
    public static final String TRANSFER_REFERENCE = TRANSFER_BASE + "/reference/{ref}";

    // -- Ledger --
    public static final String LEDGER_BASE = "/ledger";
    public static final String LEDGER_TRANSACTIONS = LEDGER_BASE + "/transactions";
    public static final String LEDGER_TRANSACTION_ID = LEDGER_BASE + "/transactions/{id}";
    public static final String LEDGER_ACCOUNT_ENTRIES = LEDGER_BASE + "/accounts/{id}/entries";

    // -- Profile --
    public static final String PROFILE_BASE = "/profile";
    public static final String PROFILE_CHANGE_PASSWORD = PROFILE_BASE + "/password";
    public static final String PROFILE_CHANGE_EMAIL = PROFILE_BASE + "/email";
    public static final String PROFILE_AVATAR = PROFILE_BASE + "/avatar";

    // -- Admin --
    public static final String ADMIN_BASE = "/admin";
    public static final String ADMIN_ACCOUNTS = ADMIN_BASE + "/accounts";
    public static final String ADMIN_ACCOUNT_STATUS = ADMIN_BASE + "/accounts/{id}/status";
    public static final String ADMIN_LIMITS = ADMIN_BASE + "/limits/{accountType}";
    public static final String ADMIN_AUDIT_LOGS = ADMIN_BASE + "/audit-logs";

    public static final String PAGE_NUMBER = "page";
    public static final String PAGE_SIZE = "size";
    public static final String SORT_BY = "sort";
    public static final String SORT_DIRECTION = "direction";
    public static final String SEARCH_TERM = "q";
    public static final String FILTER_BY = "filter";

    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
}
