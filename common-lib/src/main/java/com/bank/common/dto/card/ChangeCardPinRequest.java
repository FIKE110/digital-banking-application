package com.bank.common.dto.card;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeCardPinRequest {

    @NotBlank
    private String currentPin;

    @NotBlank
    private String newPin;
}
