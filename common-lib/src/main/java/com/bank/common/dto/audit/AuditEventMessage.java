package com.bank.common.dto.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEventMessage {

    private String eventType;
    private String action;

    private String actorId;
    private String actorType;
    private String actorName;
    private String actorEmail;

    private String targetType;
    private String targetId;
    private String targetName;

    private String ipAddress;
    private String userAgent;
    private String deviceId;

    private String serviceName;
    private String requestId;
    private String correlationId;

    private String status;
    private String riskLevel;
    private String reason;

    private String before;
    private String after;
    private String metadata;

    private String amount;
    private String currency;

    private String occurredAt;
}