package com.bank.common.dto.bill;

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
public class BillPaymentResponse {

    private UUID id;

    private String reference;

    private String sourceAccountNumber;

    private String provider;

    private String customerReference;

    private BigDecimal amount;

    private String description;

    private String status;

    private LocalDateTime createdAt;
}
