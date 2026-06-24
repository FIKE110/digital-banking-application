package com.bank.extern.email.listener;

import com.bank.common.dto.outbox.OutboxEventMessage;
import com.bank.extern.email.service.NotificationService;
import com.bank.extern.email.service.TemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationListener {

    private final NotificationService notificationService;
    private final TemplateService templateService;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "${app.rabbitmq.queue.notification:email.notification.queue}")
    public void handleNotification(String message) {
        try {
            OutboxEventMessage event = objectMapper.readValue(message, OutboxEventMessage.class);
            Map<String, String> payload = objectMapper.readValue(
                    event.getPayload(), new TypeReference<Map<String, String>>() {});

            switch (event.getEventType()) {
                case "USER_REGISTERED" -> sendWelcomeEmail(payload, event);
                case "PASSWORD_RESET" -> sendPasswordResetConfirmation(payload, event);
                case "TRANSACTION_COMPLETED" -> sendTransactionCompleted(payload, event);
                case "ACCOUNT_LOCKED" -> sendAccountLocked(payload, event);
                default -> log.warn("Unknown event type: {}", event.getEventType());
            }
        } catch (Exception e) {
            log.error("Failed to process notification event: {}", e.getMessage());
        }
    }

    private void sendWelcomeEmail(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = new HashMap<>();
        variables.put("name", payload.get("name"));
        String html = templateService.render("templates/email/welcome.html", variables);
        send(payload.get("email"), "Welcome to Banking Platform", html, event.getAggregateId());
    }

    private void sendPasswordResetConfirmation(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = new HashMap<>();
        variables.put("name", payload.get("name"));
        String html = templateService.render("templates/email/password-reset-confirmation.html", variables);
        send(payload.get("email"), "Password Reset Successful", html, event.getAggregateId());
    }

    private void sendTransactionCompleted(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = new HashMap<>();
        variables.put("name", payload.get("name"));
        variables.put("amount", payload.get("amount"));
        variables.put("type", payload.get("type"));
        variables.put("balance", payload.get("balance"));
        String html = templateService.render("templates/email/transaction-completed.html", variables);
        send(payload.get("email"), "Transaction Completed", html, event.getAggregateId());
    }

    private void sendAccountLocked(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = new HashMap<>();
        variables.put("name", payload.get("name"));
        String html = templateService.render("templates/email/account-locked.html", variables);
        send(payload.get("email"), "Account Locked", html, event.getAggregateId());
    }

    private void send(String to, String subject, String html, String aggregateId) {
        try {
            notificationService.notify(to, subject, html);
            log.info("Email sent to {} for event {}", to, aggregateId);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
