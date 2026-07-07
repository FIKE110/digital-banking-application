package com.bank.common.dto.account;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class AccountBalanceResponse {

    private UUID accountId;

    private String accountNumber;

    private BigDecimal balance;

    private String currency;
}