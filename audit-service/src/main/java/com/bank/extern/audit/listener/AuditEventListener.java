package com.bank.extern.audit.listener;

import com.bank.common.dto.outbox.OutboxEventMessage;
import com.bank.extern.audit.model.AuditEvent;
import com.bank.extern.audit.model.AuditEventRepository;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

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

            AuditEvent auditEvent = AuditEvent.builder()
                    .eventType(event.getEventType())
                    .aggregateType(event.getAggregateType())
                    .aggregateId(event.getAggregateId())
                    .payload(event.getPayload())
                    .actor("system")
                    .build();

            auditEventRepository.save(auditEvent);
            log.info("Audit event saved: {} {}", event.getAggregateType(), event.getEventType());
        } catch (Exception e) {
            log.error("Failed to process audit event: {}", e.getMessage());
        }
    }
}