package com.bank.common.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
public class CreateAccountRequest {

    @NotBlank
    private String accountName;

    @NotBlank
    private String accountType;

    @NotBlank
    private String currency;

    @NotNull
    private BigDecimal openingBalance;

    @NotNull
    private String status;

    @NotNull
    private LocalDateTime createdAt;

}
