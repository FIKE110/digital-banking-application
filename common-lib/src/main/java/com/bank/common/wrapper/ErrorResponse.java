package com.bank.common.wrapper;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.Map;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
@JsonPropertyOrder({
        "success",
        "message",
        "errorCode",
        "requestId",
        "apiPath",
        "details",
        "timestamp"
})
public class ErrorResponse extends BaseResponse {
    private String errorCode;
    private String apiPath;
    private List<String> details;
}
