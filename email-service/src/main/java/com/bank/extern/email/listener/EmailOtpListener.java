package com.bank.extern.email.listener;

import com.bank.common.dto.outbox.OutboxEventMessage;
import com.bank.extern.email.service.DeliveryService;
import com.bank.extern.email.service.TemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class EmailOtpListener {

    private static final DateTimeFormatter EXPIRY_FORMAT =
            DateTimeFormatter.ofPattern("h:mm a, MMM d");

    private final DeliveryService deliveryService;
    private final TemplateService templateService;
    private final ObjectMapper objectMapper;

    @Value("${app.bank.name:5ive}")
    private String bankName;

    @Value("${app.bank.login-url:http://localhost:5173}")
    private String loginUrl;

    @RabbitListener(queues = "${app.rabbitmq.queue.otp:email.otp.queue}")
    public void handleOtpSent(String message) {
        try {
            OutboxEventMessage event = objectMapper.readValue(message, OutboxEventMessage.class);
            Map<String, String> payload = objectMapper.readValue(
                    event.getPayload(), new TypeReference<Map<String, String>>() {});

            boolean isVerification = "EMAIL_VERIFICATION".equals(payload.get("otpType"));

            Map<String, String> variables = new HashMap<>();
            variables.put("bankName", bankName);
            variables.put("loginUrl", loginUrl);
            variables.put("name", payload.get("name"));
            variables.put("otpCode", payload.get("otpCode"));
            variables.put("expiresAt", payload.get("expiresAt"));
            variables.put("expiresAtDisplay", formatExpiry(payload.get("expiresAt")));

            if (isVerification) {
                String html = templateService.render("templates/email/verify.html", variables);
                deliveryService.deliver("OTP", payload.get("email"),
                        "Your " + bankName + " verification code", html, event.getAggregateId());
            } else {
                String html = templateService.render("templates/email/otp.html", variables);
                deliveryService.deliver("OTP", payload.get("email"), "Your OTP Code", html, event.getAggregateId());
            }

            log.info("{} email queued for {} event {}", isVerification ? "Verification" : "OTP",
                    payload.get("email"), event.getAggregateId());
        } catch (Exception e) {
            log.error("Failed to process OTP_SENT event: {}", e.getMessage());
        }
    }

    private String formatExpiry(String isoExpiry) {
        try {
            return LocalDateTime.parse(isoExpiry).format(EXPIRY_FORMAT);
        } catch (Exception e) {
            return isoExpiry;
        }
    }

    @Scheduled(fixedDelay = 30000)
    public void retryFailedDeliveries() {
        deliveryService.retryPending();
    }
}
