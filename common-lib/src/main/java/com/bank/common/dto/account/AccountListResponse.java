package com.bank.common.dto.account;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class AccountListResponse {

    private UUID id;

    private String accountNumber;

    private String accountName;

    private String accountType;

    private BigDecimal balance;

    private String status;
}
