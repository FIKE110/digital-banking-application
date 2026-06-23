package com.bank.common.util;

import com.bank.common.constant.StringConstant;

public final class StringUtils {

    private StringUtils() {}

    public static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public static String defaultIfBlank(String value, String defaultVal) {
        return isBlank(value) ? defaultVal : value;
    }

    public static String capitalize(String value) {
        if (isBlank(value)) return value;
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }

    public static String mask(String value, int visibleChars) {
        if (value == null) return null;
        if (value.length() <= visibleChars) return value;
        return StringConstant.ASTERISK.repeat(value.length() - visibleChars)
                + value.substring(value.length() - visibleChars);
    }

    public static String truncate(String value, int maxLength) {
        if (value == null) return null;
        if (value.length() <= maxLength) return value;
        return value.substring(0, maxLength);
    }

    public static String truncateWithEllipsis(String value, int maxLength) {
        if (value == null) return null;
        if (value.length() <= maxLength) return value;
        return value.substring(0, Math.max(0, maxLength - 3)) + "...";
    }

    public static String toSnakeCase(String camelCase) {
        if (camelCase == null) return null;
        return camelCase.replaceAll("([a-z])([A-Z]+)", "$1_$2").toLowerCase();
    }

    public static String toCamelCase(String snakeCase) {
        if (snakeCase == null) return null;
        StringBuilder result = new StringBuilder();
        boolean nextUpper = false;
        for (char c : snakeCase.toCharArray()) {
            if (c == '_') {
                nextUpper = true;
            } else if (nextUpper) {
                result.append(Character.toUpperCase(c));
                nextUpper = false;
            } else {
                result.append(Character.toLowerCase(c));
            }
        }
        return result.toString();
    }
}
