package com.bank.common.wrapper;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.Map;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
public class ApiResponse<T> extends BaseResponse {
    private T data;
    private Map<String, Object> metadata;
}
