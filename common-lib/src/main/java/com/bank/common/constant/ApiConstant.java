package com.bank.common.constant;

public final class ApiConstant {

    private ApiConstant() {}

    public static final String API_BASE_PATH = "/api";
    public static final String API_V1_PATH = "/api/v1";

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
