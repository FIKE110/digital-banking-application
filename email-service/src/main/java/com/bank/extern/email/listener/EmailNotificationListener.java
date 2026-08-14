package com.bank.extern.email.listener;

import com.bank.common.dto.outbox.OutboxEventMessage;
import com.bank.extern.email.service.DeliveryService;
import com.bank.extern.email.service.TemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationListener {

    private final DeliveryService deliveryService;
    private final TemplateService templateService;
    private final ObjectMapper objectMapper;

    @Value("${app.bank.name:5ive}")
    private String bankName;

    @Value("${app.bank.support-email:support@5ive.bank}")
    private String supportEmail;

    @Value("${app.bank.website:5ive.bank}")
    private String website;

    @Value("${app.bank.login-url:http://localhost:5173}")
    private String loginUrl;

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
                case "DEPOSIT_COMPLETED" -> sendDepositCompleted(payload, event);
                case "ACCOUNT_LOCKED" -> sendAccountLocked(payload, event);
                case "OTP_SENT" -> sendOtpSent(payload, event);
                case "BILL_PAYMENT_COMPLETED" -> sendBillPaymentCompleted(payload, event);
                case "ADMIN_ACTION_ALERT" -> sendAdminActionAlert(payload, event);
                case "ADMIN_CRITICAL_ACTION" -> sendAdminCriticalAction(payload, event);
                case "ADMIN_AUDIT" -> sendAdminAuditAlert(payload, event);
                default -> log.warn("Unknown event type: {}", event.getEventType());
            }
        } catch (Exception e) {
            log.error("Failed to process notification event: {}", e.getMessage());
        }
    }

    private Map<String, String> baseVariables() {
        Map<String, String> variables = new HashMap<>();
        variables.put("bankName", bankName);
        variables.put("supportEmail", supportEmail);
        variables.put("website", website);
        variables.put("loginUrl", loginUrl);
        return variables;
    }

    private void sendWelcomeEmail(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("name", payload.get("name"));
        String html = templateService.render("templates/email/welcome.html", variables);
        deliveryService.deliver("WELCOME", payload.get("email"), "Welcome to " + bankName, html, event.getAggregateId());
    }

    private void sendPasswordResetConfirmation(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("name", payload.get("name"));
        String html = templateService.render("templates/email/password-reset-confirmation.html", variables);
        deliveryService.deliver("PASSWORD_RESET", payload.get("email"), "Password Reset Successful", html, event.getAggregateId());
    }

    private void sendTransactionCompleted(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("name", payload.get("name"));
        variables.put("amount", payload.get("amount"));
        variables.put("type", payload.get("type"));
        variables.put("balance", payload.get("balance"));
        String html = templateService.render("templates/email/transaction-completed.html", variables);
        deliveryService.deliver("TRANSACTION_COMPLETED", payload.get("email"), "Transaction Completed", html, event.getAggregateId());
    }

    private void sendAccountLocked(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("name", payload.get("name"));
        String html = templateService.render("templates/email/account-locked.html", variables);
        deliveryService.deliver("ACCOUNT_LOCKED", payload.get("email"), "Account Locked", html, event.getAggregateId());
    }

    private void sendBillPaymentCompleted(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("name", payload.get("name"));
        variables.put("amount", payload.get("amount"));
        variables.put("type", "debit");
        variables.put("provider", payload.getOrDefault("provider", "Biller"));
        variables.put("balance", payload.getOrDefault("balance", "0.00"));
        String html = templateService.render("templates/email/transaction-completed.html", variables);
        deliveryService.deliver("BILL_PAYMENT_COMPLETED", payload.get("email"), "Bill Payment Completed", html, event.getAggregateId());
    }

    private void sendAdminActionAlert(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("adminName", "Administrator");
        variables.put("eventType", payload.getOrDefault("eventType", "UNKNOWN"));
        variables.put("riskLevel", payload.getOrDefault("riskLevel", "HIGH"));
        variables.put("adminUsername", payload.getOrDefault("adminUsername", "Unknown"));
        variables.put("targetType", payload.getOrDefault("targetType", "Unknown"));
        variables.put("targetName", payload.getOrDefault("targetName", "Unknown"));
        variables.put("reason", payload.getOrDefault("reason", "No reason provided"));
        String html = templateService.render("templates/email/admin-action-alert.html", variables);
        deliveryService.deliver("ADMIN_ACTION_ALERT", payload.get("email"), "Admin Action Alert", html, event.getAggregateId());
    }

    private void sendAdminCriticalAction(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("adminName", "Administrator");
        variables.put("eventType", payload.getOrDefault("eventType", "UNKNOWN"));
        variables.put("requestingAdmin", payload.getOrDefault("adminUsername", "Unknown"));
        variables.put("targetType", payload.getOrDefault("targetType", "Unknown"));
        variables.put("targetName", payload.get("targetName") != null ? payload.get("targetName") : "Unknown");
        variables.put("amount", payload.getOrDefault("amount", "N/A"));
        variables.put("reason", payload.getOrDefault("reason", "No reason provided"));
        String html = templateService.render("templates/email/admin-critical-action.html", variables);
        deliveryService.deliver("ADMIN_CRITICAL_ACTION", payload.get("email"), "Admin Critical Action - Approval Required", html, event.getAggregateId());
    }

    private void sendDepositCompleted(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("name", payload.get("name"));
        variables.put("amount", payload.get("amount"));
        variables.put("type", "credit");
        variables.put("balance", payload.get("balance"));
        String html = templateService.render("templates/email/transaction-completed.html", variables);
        deliveryService.deliver("DEPOSIT_COMPLETED", payload.get("email"), "Deposit Completed", html, event.getAggregateId());
    }

    private void sendOtpSent(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("name", payload.get("name"));
        variables.put("otpCode", payload.get("otp"));
        variables.put("expiresAt", payload.get("expiresAt"));
        String html = templateService.render("templates/email/otp.html", variables);
        deliveryService.deliver("OTP_SENT", payload.get("email"), "Your One-Time Password", html, event.getAggregateId());
    }

    private void sendAdminAuditAlert(Map<String, String> payload, OutboxEventMessage event) {
        Map<String, String> variables = baseVariables();
        variables.put("adminName", payload.getOrDefault("adminUsername", "Administrator"));
        variables.put("eventType", payload.getOrDefault("eventType", "UNKNOWN"));
        variables.put("riskLevel", payload.getOrDefault("riskLevel", "MEDIUM"));
        variables.put("targetType", payload.getOrDefault("targetType", "Unknown"));
        variables.put("targetName", payload.getOrDefault("targetName", "Unknown"));
        variables.put("reason", payload.getOrDefault("reason", "No reason provided"));
        String html = templateService.render("templates/email/admin-action-alert.html", variables);
        deliveryService.deliver("ADMIN_AUDIT", payload.get("email"), "Admin Action Notification", html, event.getAggregateId());
    }
}