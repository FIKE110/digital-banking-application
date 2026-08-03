package com.bank.common.dto.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepositResponse {

    private UUID accountId;

    private String accountNumber;

    private BigDecimal amount;

    private String description;

    private BigDecimal balance;

    private String currency;

    private String reference;

    private LocalDateTime createdAt;
}
