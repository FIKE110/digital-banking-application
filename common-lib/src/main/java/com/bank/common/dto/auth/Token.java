package com.bank.common.dto.auth;


import lombok.Data;

@Data
public class Token {
    private String accessToken;
    private String refreshToken;
}
