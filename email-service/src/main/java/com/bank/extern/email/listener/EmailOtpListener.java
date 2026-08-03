package com.bank.extern.email.listener;

import com.bank.common.dto.outbox.OutboxEventMessage;
import com.bank.extern.email.service.DeliveryService;
import com.bank.extern.email.service.TemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class EmailOtpListener {

    private final DeliveryService deliveryService;
    private final TemplateService templateService;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "${app.rabbitmq.queue.otp:email.otp.queue}")
    public void handleOtpSent(String message) {
        try {
            OutboxEventMessage event = objectMapper.readValue(message, OutboxEventMessage.class);
            Map<String, String> payload = objectMapper.readValue(
                    event.getPayload(), new TypeReference<Map<String, String>>() {});

            Map<String, String> variables = new HashMap<>();
            variables.put("name", payload.get("name"));
            variables.put("otpCode", payload.get("otpCode"));
            variables.put("expiresAt", payload.get("expiresAt"));

            String html = templateService.render("templates/email/otp.html", variables);
            deliveryService.deliver("OTP", payload.get("email"), "Your OTP Code", html, event.getAggregateId());
            log.info("OTP email queued for {} event {}", payload.get("email"), event.getAggregateId());
        } catch (Exception e) {
            log.error("Failed to process OTP_SENT event: {}", e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 30000)
    public void retryFailedDeliveries() {
        deliveryService.retryPending();
    }
}