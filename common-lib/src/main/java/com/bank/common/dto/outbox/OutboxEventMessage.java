package com.bank.common.dto.outbox;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEventMessage {
    private String eventType;
    private String aggregateType;
    private String aggregateId;
    private String payload;
}
