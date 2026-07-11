package com.bank.common.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UpdateAccountStatusRequest {

    @NotBlank
    private String status;
}