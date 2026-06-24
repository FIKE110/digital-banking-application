package com.bank.common.dto.auth;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class UserResponseDto {
    private String username;
    private String email;
    private String uid;
    private Set<String> roleNames;
    private Set<String> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
