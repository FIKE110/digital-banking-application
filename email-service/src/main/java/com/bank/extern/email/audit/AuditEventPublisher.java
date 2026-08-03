package com.bank.extern.email.audit;

import com.bank.common.dto.outbox.OutboxEventMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import static com.bank.extern.email.config.RabbitMQConfig.EXCHANGE;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public void publish(String eventType, String aggregateId, String payload) {
        try {
            String routingKey = "audit." + eventType.toLowerCase();
            OutboxEventMessage message = OutboxEventMessage.builder()
                    .eventType(eventType)
                    .aggregateType("AUDIT")
                    .aggregateId(aggregateId)
                    .payload(payload)
                    .build();
            rabbitTemplate.convertAndSend(EXCHANGE, routingKey, objectMapper.writeValueAsString(message));
            log.debug("Published audit event {} ({})", eventType, aggregateId);
        } catch (Exception e) {
            log.error("Failed to publish audit event {}: {}", eventType, e.getMessage());
        }
    }
}