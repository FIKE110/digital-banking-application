package com.bank.common.dto.admin;

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
public class AdminBeneficiaryResponse {

    private UUID id;
    private String alias;
    private String accountNumber;
    private String bankName;
    private String description;
    private Long userId;
    private String username;
    private LocalDateTime createdAt;
}