package com.bank.common.wrapper;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@SuperBuilder
public abstract class BaseResponse {
    private String success;
    private String message;
    private String requestId;
    private LocalDateTime timestamp;
}
