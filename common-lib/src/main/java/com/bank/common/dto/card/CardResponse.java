package com.bank.common.dto.card;

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
public class CardResponse {

    private UUID id;

    private Long userId;

    private String accountNumber;

    private String cardNumber;

    private String cardType;

    private LocalDate expiryDate;

    private String cvv;

    private String status;

    private BigDecimal dailyLimit;

    private BigDecimal monthlyLimit;

    private LocalDateTime createdAt;
}
