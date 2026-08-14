package com.bank.common.dto.transfer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolvedAccountResponse {

    private String accountNumber;
    private String accountName;
    private String currency;
    private String status;
    private boolean transferable;
}