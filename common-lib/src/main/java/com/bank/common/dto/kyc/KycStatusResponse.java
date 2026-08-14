package com.bank.common.dto.kyc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycStatusResponse {

    private Long id;
    private String bvnVerificationStatus;
    private String ninVerificationStatus;
    private String tier;
    private boolean verified;
    private String bvn;
    private String nin;
}