package com.bank.core.app.admin;

import com.bank.common.dto.audit.AuditEventMessage;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.outbox.OutboxService;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.user.User;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final OutboxService outboxService;
    private final SecurityUtil securityUtil;
    private final ObjectMapper objectMapper;
    private final AdminNotificationService adminNotificationService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void audit(AdminAuditEventType eventType, String targetType, String targetId,
                      String targetName, String reason, HttpServletRequest request) {
        audit(eventType, targetType, targetId, targetName, reason, null, null, null, request);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void audit(AdminAuditEventType eventType, String targetType, String targetId,
                      String targetName, String reason, String before, String after,
                      HttpServletRequest request) {
        audit(eventType, targetType, targetId, targetName, reason, before, after, null, request);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void audit(AdminAuditEventType eventType, String targetType, String targetId,
                      String targetName, String reason, String before, String after,
                      BigDecimal amount, HttpServletRequest request) {
        try {
            User admin = securityUtil.currentUser();

            AuditEventMessage message = AuditEventMessage.builder()
                    .eventType(eventType.getCode())
                    .action(eventType.getCode())
                    .actorId(String.valueOf(admin.getId()))
                    .actorType("ADMIN")
                    .actorName(admin.getUsername())
                    .actorEmail(admin.getEmail())
                    .targetType(targetType)
                    .targetId(targetId)
                    .targetName(targetName)
                    .riskLevel(eventType.getRiskLevel())
                    .reason(reason)
                    .before(before)
                    .after(after)
                    .serviceName("core-app-service")
                    .requestId(UUID.randomUUID().toString())
                    .status("COMPLETED")
                    .occurredAt(LocalDateTime.now().toString())
                    .build();

            if (request != null) {
                message.setIpAddress(getClientIp(request));
                message.setUserAgent(request.getHeader("User-Agent"));
                message.setDeviceId(request.getHeader("X-Device-Id"));
            }

            if (amount != null) {
                message.setAmount(amount.toPlainString());
            }

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("adminId", admin.getId());
            metadata.put("adminUsername", admin.getUsername());
            metadata.put("adminEmail", admin.getEmail());
            metadata.put("eventType", eventType.getCode());
            metadata.put("riskLevel", eventType.getRiskLevel());
            if (reason != null) {
                metadata.put("reason", reason);
            }
            message.setMetadata(objectMapper.writeValueAsString(metadata));

            String payload = objectMapper.writeValueAsString(message);
            String aggregateId = targetId != null ? targetId : String.valueOf(admin.getId());

            outboxService.saveEvent("ADMIN_AUDIT", aggregateId, eventType.getCode(),
                    payload, LocalDateTime.now().plusYears(100));

            log.info("Admin audit: {} by admin {} on {} {}", eventType.getCode(),
                    admin.getUsername(), targetType, targetId);

            if (eventType.isHighRisk()) {
                adminNotificationService.notifyAdmins(eventType, targetType, targetId,
                        targetName, reason, admin.getUsername());
            }

            if (eventType.requiresNotification()) {
                log.warn("CRITICAL admin action: {} by {} on {} {}", eventType.getCode(),
                        admin.getUsername(), targetType, targetId);
                adminNotificationService.notifyHighRiskAction(eventType, targetType, targetId,
                        targetName, reason, admin.getUsername());
            }
        } catch (Exception e) {
            log.error("Failed to create admin audit event: {}", e.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void auditWithCorrelation(AdminAuditEventType eventType, String targetType,
                                     String targetId, String targetName, String reason,
                                     String correlationId, HttpServletRequest request) {
        try {
            User admin = securityUtil.currentUser();

            AuditEventMessage message = AuditEventMessage.builder()
                    .eventType(eventType.getCode())
                    .action(eventType.getCode())
                    .actorId(String.valueOf(admin.getId()))
                    .actorType("ADMIN")
                    .actorName(admin.getUsername())
                    .actorEmail(admin.getEmail())
                    .targetType(targetType)
                    .targetId(targetId)
                    .targetName(targetName)
                    .riskLevel(eventType.getRiskLevel())
                    .reason(reason)
                    .correlationId(correlationId)
                    .serviceName("core-app-service")
                    .requestId(UUID.randomUUID().toString())
                    .status("COMPLETED")
                    .occurredAt(LocalDateTime.now().toString())
                    .build();

            if (request != null) {
                message.setIpAddress(getClientIp(request));
                message.setUserAgent(request.getHeader("User-Agent"));
                message.setDeviceId(request.getHeader("X-Device-Id"));
            }

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("adminId", admin.getId());
            metadata.put("adminUsername", admin.getUsername());
            metadata.put("adminEmail", admin.getEmail());
            metadata.put("eventType", eventType.getCode());
            metadata.put("riskLevel", eventType.getRiskLevel());
            if (reason != null) {
                metadata.put("reason", reason);
            }
            if (correlationId != null) {
                metadata.put("correlationId", correlationId);
            }
            message.setMetadata(objectMapper.writeValueAsString(metadata));

            String payload = objectMapper.writeValueAsString(message);
            String aggregateId = targetId != null ? targetId : String.valueOf(admin.getId());

            outboxService.saveEvent("ADMIN_AUDIT", aggregateId, eventType.getCode(),
                    payload, LocalDateTime.now().plusYears(100));

            log.info("Admin audit with correlation: {} by admin {} on {} {} [corr={}]",
                    eventType.getCode(), admin.getUsername(), targetType, targetId, correlationId);
        } catch (Exception e) {
            log.error("Failed to create admin audit event with correlation: {}", e.getMessage());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
