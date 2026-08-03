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
public class AdminCustomerResponse {

    private Long id;
    private String username;
    private String email;
    private String uid;
    private String status;
    private int accountCount;
    private LocalDateTime createdAt;
}
