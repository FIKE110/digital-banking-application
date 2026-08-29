package com.bank.common.dto.auth;

import lombok.Data;

@Data
public class VerifyEmailRequestDto {
    private String email;
    private String otp;
}
