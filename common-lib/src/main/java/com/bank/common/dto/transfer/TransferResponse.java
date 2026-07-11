package com.bank.common.dto.transfer;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TransferResponse {

    private UUID id;

    private String reference;

    private String sourceAccountNumber;

    private String destinationAccountNumber;

    private BigDecimal amount;

    private String description;

    private String status;

    private LocalDateTime createdAt;
}