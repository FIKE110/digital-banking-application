package com.bank.core.app.admin;

import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.notification.NotificationService;
import com.bank.core.app.outbox.OutboxService;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final OutboxService outboxService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final List<AdminAuditEventType> EMAIL_NOTIFY_EVENTS = List.of(
            AdminAuditEventType.CUSTOMER_DELETED,
            AdminAuditEventType.MANUAL_DEBIT,
            AdminAuditEventType.MANUAL_CREDIT,
            AdminAuditEventType.BALANCE_ADJUSTED,
            AdminAuditEventType.TRANSACTION_REVERSED,
            AdminAuditEventType.ACCOUNT_FROZEN,
            AdminAuditEventType.ACCOUNT_UNFROZEN,
            AdminAuditEventType.ACCOUNT_CLOSED,
            AdminAuditEventType.ADMIN_CREATED,
            AdminAuditEventType.ADMIN_DISABLED,
            AdminAuditEventType.ADMIN_ROLE_CHANGED,
            AdminAuditEventType.PERMISSION_GRANTED,
            AdminAuditEventType.PERMISSION_REVOKED,
            AdminAuditEventType.ROLE_CREATED,
            AdminAuditEventType.ROLE_DELETED,
            AdminAuditEventType.MFA_DISABLED,
            AdminAuditEventType.PASSWORD_RESET,
            AdminAuditEventType.SECURITY_SETTINGS_CHANGED,
            AdminAuditEventType.CUSTOMER_AUTH_BYPASSED,
            AdminAuditEventType.TRANSACTION_LIMIT_CHANGED,
            AdminAuditEventType.ACCOUNT_LIMIT_CHANGED,
            AdminAuditEventType.CARD_FROZEN,
            AdminAuditEventType.CARD_UNFROZEN,
            AdminAuditEventType.PIN_RESET,
            AdminAuditEventType.DATA_EXPORTED,
            AdminAuditEventType.BULK_ACTION_PERFORMED
    );

    public void notifyAdmins(AdminAuditEventType eventType, String targetType, String targetId,
                             String targetName, String reason, String adminUsername) {
        if (!eventType.isHighRisk()) {
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("eventType", eventType.getCode());
            payload.put("riskLevel", eventType.getRiskLevel());
            payload.put("targetType", targetType);
            payload.put("targetId", targetId);
            payload.put("targetName", targetName);
            payload.put("reason", reason);
            payload.put("adminUsername", adminUsername);
            payload.put("timestamp", LocalDateTime.now().toString());

            String emailPayload = objectMapper.writeValueAsString(payload);

            if (EMAIL_NOTIFY_EVENTS.contains(eventType)) {
                List<User> admins = userRepository.findAll().stream()
                        .filter(u -> u.getRoles() != null && u.getRoles().stream()
                                .anyMatch(r -> "ADMIN".equals(r.getRoleName())))
                        .filter(u -> !u.getUsername().equals(adminUsername))
                        .toList();

                for (User admin : admins) {
                    outboxService.saveEvent("ADMIN_ALERT", String.valueOf(admin.getId()),
                            "ADMIN_ACTION_ALERT", emailPayload, LocalDateTime.now().plusYears(100));

                    notificationService.notify(admin.getId(), "SECURITY",
                            "Admin Action Alert",
                            adminUsername + " performed " + eventType.getCode() + " on " + targetType);
                }
            }

            log.info("Admin notification sent for {} by {}", eventType.getCode(), adminUsername);
        } catch (Exception e) {
            log.error("Failed to send admin notification: {}", e.getMessage());
        }
    }

    public void notifyHighRiskAction(AdminAuditEventType eventType, String targetType,
                                     String targetId, String targetName, String reason,
                                     String adminUsername) {
        if (!eventType.requiresNotification()) {
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("eventType", eventType.getCode());
            payload.put("riskLevel", "CRITICAL");
            payload.put("targetType", targetType);
            payload.put("targetId", targetId);
            payload.put("targetName", targetName);
            payload.put("reason", reason);
            payload.put("adminUsername", adminUsername);
            payload.put("timestamp", LocalDateTime.now().toString());
            payload.put("requiresApproval", true);

            String emailPayload = objectMapper.writeValueAsString(payload);

            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> u.getRoles() != null && u.getRoles().stream()
                            .anyMatch(r -> "ADMIN".equals(r.getRoleName())))
                    .filter(u -> !u.getUsername().equals(adminUsername))
                    .toList();

                for (User admin : admins) {
                    outboxService.saveEvent("ADMIN_ALERT", String.valueOf(admin.getId()),
                            "ADMIN_CRITICAL_ACTION", emailPayload, LocalDateTime.now().plusYears(100));

                notificationService.notify(admin.getId(), "SECURITY",
                        "CRITICAL Admin Action",
                        adminUsername + " performed CRITICAL action: " + eventType.getCode());
            }

            log.warn("CRITICAL admin notification sent for {} by {}", eventType.getCode(), adminUsername);
        } catch (Exception e) {
            log.error("Failed to send critical admin notification: {}", e.getMessage());
        }
    }
}
