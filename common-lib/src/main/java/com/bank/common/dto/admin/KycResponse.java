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
public class KycResponse {

    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String bvn;
    private String bvnStatus;
    private String nin;
    private String ninStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}