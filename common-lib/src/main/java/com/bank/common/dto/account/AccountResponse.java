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
public class AccountResponse {

    private UUID id;

    private String accountNumber;

    private String accountName;

    private String accountType;

    private BigDecimal balance;

    private String currency;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}