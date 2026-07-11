package com.bank.common.dto.transaction;

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
public class TransactionResponse {

    private UUID id;

    private String reference;

    private String accountNumber;

    private String counterpartyAccountNumber;

    private BigDecimal amount;

    private String type;

    private String description;

    private String status;

    private LocalDateTime createdAt;
}