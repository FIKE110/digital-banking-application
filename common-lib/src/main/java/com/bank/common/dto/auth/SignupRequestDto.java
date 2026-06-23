package com.bank.common.dto.auth;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SignupRequestDto {
    private String username;
    private String password;
    private String email;
}
