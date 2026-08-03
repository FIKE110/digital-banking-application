package com.bank.extern.email.service;

import com.bank.common.dto.audit.AuditEventMessage;
import com.bank.extern.email.audit.AuditEventPublisher;
import com.bank.extern.email.model.EmailDelivery;
import com.bank.extern.email.model.EmailDeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {

    private static final int MAX_RETRIES = 5;

    private final EmailDeliveryRepository deliveryRepository;
    private final NotificationService notificationService;
    private final AuditEventPublisher auditEventPublisher;
    private final tools.jackson.databind.ObjectMapper objectMapper;

    @Transactional
    public EmailDelivery deliver(String notificationType, String to, String subject, String html,
                                 String relatedEventId) {
        EmailDelivery delivery = EmailDelivery.builder()
                .recipient(to)
                .notificationType(notificationType)
                .subject(subject)
                .body(html)
                .relatedEventId(relatedEventId)
                .status(EmailDelivery.STATUS_PENDING)
                .retryCount(0)
                .build();
        deliveryRepository.save(delivery);
        recordAudit("EMAIL_QUEUED", delivery, null);

        attemptSend(delivery);
        return delivery;
    }

    @Transactional
    public void retryPending() {
        List<EmailDelivery> failed = deliveryRepository.findByStatusOrderByCreatedAtAsc(EmailDelivery.STATUS_FAILED);
        failed.stream()
                .filter(d -> d.getRetryCount() < MAX_RETRIES)
                .forEach(this::attemptSend);
    }

    @Transactional
    public void attemptSend(EmailDelivery delivery) {
        delivery.setRetryCount(delivery.getRetryCount() + 1);
        delivery.setStatus(EmailDelivery.STATUS_RETRYING);
        delivery.setUpdatedAt(LocalDateTime.now());
        deliveryRepository.save(delivery);
        recordAudit("EMAIL_RETRY", delivery, null);

        try {
            notificationService.notify(delivery.getRecipient(), delivery.getSubject(), delivery.getBody());
            delivery.setStatus(EmailDelivery.STATUS_SENT);
            delivery.setSentAt(LocalDateTime.now());
            delivery.setFailureReason(null);
            delivery.setUpdatedAt(LocalDateTime.now());
            deliveryRepository.save(delivery);
            recordAudit("EMAIL_SENT", delivery, null);
            log.info("Email {} -> {} SENT after attempt {}", delivery.getNotificationType(),
                    delivery.getRecipient(), delivery.getRetryCount());
        } catch (Exception e) {
            delivery.setFailureReason(e.getMessage());
            delivery.setStatus(EmailDelivery.STATUS_FAILED);
            delivery.setUpdatedAt(LocalDateTime.now());
            deliveryRepository.save(delivery);
            recordAudit("EMAIL_FAILED", delivery, e.getMessage());
            log.warn("Email {} -> {} failed (attempt {}): {}", delivery.getNotificationType(),
                    delivery.getRecipient(), delivery.getRetryCount(), e.getMessage());
        }
    }

    private void recordAudit(String eventType, EmailDelivery delivery, String failureReason) {
        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("notificationId", delivery.getId().toString());
            metadata.put("channel", "EMAIL");
            metadata.put("recipient", maskEmail(delivery.getRecipient()));
            metadata.put("retryCount", String.valueOf(delivery.getRetryCount()));
            if (failureReason != null) {
                metadata.put("failureReason", failureReason);
            }
            AuditEventMessage audit = AuditEventMessage.builder()
                    .eventType(eventType)
                    .action(eventType)
                    .actorType("SYSTEM")
                    .targetType("EMAIL_NOTIFICATION")
                    .targetId(delivery.getId().toString())
                    .serviceName("email-service")
                    .status(delivery.getStatus())
                    .occurredAt(LocalDateTime.now().toString())
                    .metadata(objectMapper.writeValueAsString(metadata))
                    .build();
            auditEventPublisher.publish(eventType, delivery.getId().toString(),
                    objectMapper.writeValueAsString(audit));
        } catch (Exception e) {
            log.error("Failed to record audit for {}: {}", eventType, e.getMessage());
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String local = parts[0];
        String masked = local.length() <= 2
                ? local.charAt(0) + "***"
                : local.substring(0, 1) + "***" + local.substring(local.length() - 1);
        return masked + "@" + parts[1];
    }
}