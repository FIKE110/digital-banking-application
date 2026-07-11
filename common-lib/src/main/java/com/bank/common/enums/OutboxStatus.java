package com.bank.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum OutboxStatus {
    PENDING("Pending"),
    PUBLISHED("Published"),
    FAILED("Failed");

    private final String displayName;
}
