package com.bank.common.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCardResponse {

    private UUID id;
    private String cardNumberLast4;
    private String cardType;
    private LocalDate expiryDate;
    private String status;
    private BigDecimal dailyLimit;
    private BigDecimal monthlyLimit;
    private Long userId;
    private String username;
    private String accountNumber;
    private LocalDateTime createdAt;
}