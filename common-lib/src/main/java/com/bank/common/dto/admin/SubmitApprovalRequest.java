package com.bank.common.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitApprovalRequest {

    @NotBlank
    private String actionType;

    @NotNull
    private Map<String, Object> actionDetails;

    @NotBlank
    private String riskLevel;

    private String reason;
}
