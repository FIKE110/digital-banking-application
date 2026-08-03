package com.bank.common.dto.card;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCardLimitsRequest {

    @NotNull
    private BigDecimal dailyLimit;

    @NotNull
    private BigDecimal monthlyLimit;
}
