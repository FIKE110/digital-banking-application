package com.bank.common.dto.pin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PinStatusResponse {

    private boolean pinSet;
    private LocalDateTime pinSetAt;
}