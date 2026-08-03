package com.bank.common.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerDetailResponse {

    private AdminCustomerResponse customer;
    private String phoneNumber;
    private String gender;
    private String dateOfBirth;
    private String kycStatus;
    private List<AdminAccountResponse> accounts;
    private int cardCount;
    private int beneficiaryCount;
}
