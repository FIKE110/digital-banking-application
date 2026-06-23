package com.bank.common.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDto {
    private Token token;
}
