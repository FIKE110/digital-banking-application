package com.bank.common.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {

    @NotBlank
    private String accountName;

    @NotBlank
    private String accountType;

    @NotBlank
    private String currency;

    @NotNull
    private BigDecimal openingBalance;

    @NotBlank
    private String status;

}
