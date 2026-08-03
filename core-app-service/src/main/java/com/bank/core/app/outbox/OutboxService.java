package com.bank.core.app.outbox;

import com.bank.common.dto.outbox.OutboxEventMessage;
import com.bank.common.enums.OutboxStatus;
import com.bank.core.data.outbox.OutboxEvent;
import com.bank.core.data.outbox.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;

import static com.bank.core.app.config.RabbitMQConfig.EXCHANGE;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxService {

    private static final int MAX_RETRIES =3;

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public void saveEvent(String aggregateType, String aggregateId, String eventType,
                          String payload, LocalDateTime validUntil) {
        OutboxEvent event = OutboxEvent.builder()
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(payload)
                .validUntil(validUntil)
                .status(OutboxStatus.PENDING)
                .retryCount(0)
                .build();
        outboxEventRepository.save(event);
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processPendingEvents() {
        List<OutboxEvent> events = outboxEventRepository
                .findDue(OutboxStatus.PENDING, LocalDateTime.now()).stream()
                .limit(100)
                .toList();

        for (OutboxEvent event : events) {
            try {
                String routingKey = event.getAggregateType().toLowerCase() + "." + event.getEventType().toLowerCase();
                OutboxEventMessage message = OutboxEventMessage.builder()
                        .eventType(event.getEventType())
                        .aggregateType(event.getAggregateType())
                        .aggregateId(event.getAggregateId())
                        .payload(event.getPayload())
                        .build();
                rabbitTemplate.convertAndSend(EXCHANGE, routingKey, objectMapper.writeValueAsString(message));
                event.setStatus(OutboxStatus.PUBLISHED);
                event.setPublishedAt(LocalDateTime.now());
                log.info("Published outbox event {}: {} ", event.getId(), event.getEventType());
            } catch (Exception e) {
                log.error("Failed to publish outbox event {}: {}", event.getId(), e.getMessage());
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= MAX_RETRIES) {
                    event.setStatus(OutboxStatus.FAILED);
                    log.warn("Outbox event {} marked as FAILED after {} retries", event.getId(), event.getRetryCount());
                }
            }
            outboxEventRepository.save(event);
        }
    }
}
