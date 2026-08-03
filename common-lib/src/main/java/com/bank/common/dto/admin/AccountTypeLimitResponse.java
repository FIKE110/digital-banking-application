package com.bank.common.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountTypeLimitResponse {

    private String accountType;
    private BigDecimal dailyTransferLimit;
    private LocalDateTime updatedAt;
}
