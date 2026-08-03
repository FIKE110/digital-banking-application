package com.bank.common.dto.beneficiary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryResponse {

    private UUID id;

    private String alias;

    private String accountNumber;

    private String bankName;

    private String description;

    private LocalDateTime createdAt;
}
