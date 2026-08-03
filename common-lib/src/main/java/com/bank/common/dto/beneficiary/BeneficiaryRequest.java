package com.bank.common.dto.beneficiary;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryRequest {

    @NotBlank
    private String alias;

    @NotBlank
    private String accountNumber;

    private String bankName;

    private String description;
}
