package com.bank.extern.audit.listener;

import com.bank.common.dto.audit.AuditEventMessage;
import com.bank.common.dto.outbox.OutboxEventMessage;
import com.bank.extern.audit.model.AuditEvent;
import com.bank.extern.audit.model.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "audit.event.queue")
    public void handleAuditEvent(String message) {
        try {
            OutboxEventMessage event = objectMapper.readValue(message, OutboxEventMessage.class);

            AuditEvent auditEvent = parse(event);
            auditEventRepository.save(auditEvent);
            log.info("Audit event saved: {} {}/{}", auditEvent.getEventType(),
                    auditEvent.getTargetType(), auditEvent.getTargetId());
        } catch (Exception e) {
            log.error("Failed to process audit event: {}", e.getMessage());
        }
    }

    private AuditEvent parse(OutboxEventMessage event) throws Exception {
        // Rich audit events carry an AuditEventMessage payload
        try {
            AuditEventMessage msg = objectMapper.readValue(event.getPayload(), AuditEventMessage.class);
            java.math.BigDecimal amount = null;
            if (msg.getAmount() != null) {
                try {
                    amount = new java.math.BigDecimal(msg.getAmount());
                } catch (NumberFormatException ignored) {}
            }
            return AuditEvent.builder()
                    .eventType(msg.getEventType() != null ? msg.getEventType() : event.getEventType())
                    .action(msg.getAction())
                    .actorId(msg.getActorId())
                    .actorType(msg.getActorType())
                    .actorName(msg.getActorName())
                    .actorEmail(msg.getActorEmail())
                    .targetType(msg.getTargetType() != null ? msg.getTargetType() : event.getAggregateType())
                    .targetId(msg.getTargetId() != null ? msg.getTargetId() : event.getAggregateId())
                    .targetName(msg.getTargetName())
                    .ipAddress(msg.getIpAddress())
                    .userAgent(msg.getUserAgent())
                    .deviceId(msg.getDeviceId())
                    .serviceName(msg.getServiceName())
                    .requestId(msg.getRequestId())
                    .correlationId(msg.getCorrelationId())
                    .status(msg.getStatus())
                    .riskLevel(msg.getRiskLevel())
                    .reason(msg.getReason())
                    .before(msg.getBefore())
                    .after(msg.getAfter())
                    .metadata(msg.getMetadata())
                    .amount(amount)
                    .currency(msg.getCurrency())
                    .occurredAt(msg.getOccurredAt() != null ? LocalDateTime.parse(msg.getOccurredAt()) : LocalDateTime.now())
                    .build();
        } catch (Exception ignored) {
            // Fallback: parse the payload map to extract whatever context we can
            return parseLegacyPayload(event);
        }
    }

    private AuditEvent parseLegacyPayload(OutboxEventMessage event) {
        try {
            java.util.Map<String, Object> payload = objectMapper.readValue(
                    event.getPayload(), new tools.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});

            String name = (String) payload.getOrDefault("name", "Unknown");
            String email = (String) payload.getOrDefault("email", null);
            String amountStr = (String) payload.getOrDefault("amount", null);
            java.math.BigDecimal amount = null;
            if (amountStr != null) {
                try { amount = new java.math.BigDecimal(amountStr); } catch (NumberFormatException ignored) {}
            }

            String eventType = event.getEventType();
            String action = eventType;
            String targetName = name;
            String status = "COMPLETED";

            return AuditEvent.builder()
                    .eventType(eventType)
                    .action(action)
                    .actorType("USER")
                    .actorName(name)
                    .actorEmail(email)
                    .targetType(event.getAggregateType())
                    .targetId(event.getAggregateId())
                    .targetName(targetName)
                    .serviceName(event.getAggregateType().toLowerCase() + "-service")
                    .status(status)
                    .amount(amount)
                    .metadata(event.getPayload())
                    .occurredAt(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            return AuditEvent.builder()
                    .eventType(event.getEventType())
                    .action(event.getEventType())
                    .actorType("SYSTEM")
                    .targetType(event.getAggregateType())
                    .targetId(event.getAggregateId())
                    .serviceName(event.getAggregateType().toLowerCase() + "-service")
                    .status("COMPLETED")
                    .metadata(event.getPayload())
                    .occurredAt(LocalDateTime.now())
                    .build();
        }
    }
}