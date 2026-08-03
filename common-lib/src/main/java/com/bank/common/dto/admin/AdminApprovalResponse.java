package com.bank.common.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminApprovalResponse {

    private Long id;
    private String actionType;
    private String actionPayload;
    private Long requestedBy;
    private String requestedByName;
    private String status;
    private Long reviewedBy;
    private String reviewedByName;
    private String reviewNote;
    private String reason;
    private String riskLevel;
    private String correlationId;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
