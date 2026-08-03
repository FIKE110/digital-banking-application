package com.bank.extern.audit.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_events", indexes = {
        @Index(name = "idx_audit_event_type", columnList = "eventType"),
        @Index(name = "idx_audit_actor", columnList = "actorId"),
        @Index(name = "idx_audit_target", columnList = "targetType, targetId"),
        @Index(name = "idx_audit_risk_level", columnList = "riskLevel"),
        @Index(name = "idx_audit_occurred_at", columnList = "occurredAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_type", nullable = false, length = 60)
    private String eventType;

    @Column(name = "action", length = 120)
    private String action;

    @Column(name = "actor_id", length = 60)
    private String actorId;

    @Column(name = "actor_type", length = 20)
    private String actorType;

    @Column(name = "actor_name", length = 100)
    private String actorName;

    @Column(name = "actor_email", length = 150)
    private String actorEmail;

    @Column(name = "target_type", length = 40)
    private String targetType;

    @Column(name = "target_id", length = 80)
    private String targetId;

    @Column(name = "target_name", length = 100)
    private String targetName;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "device_id", length = 80)
    private String deviceId;

    @Column(name = "service_name", length = 60)
    private String serviceName;

    @Column(name = "request_id", length = 80)
    private String requestId;

    @Column(name = "correlation_id", length = 80)
    private String correlationId;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "before_state", columnDefinition = "TEXT")
    private String before;

    @Column(name = "after_state", columnDefinition = "TEXT")
    private String after;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "amount", precision = 19, scale = 4)
    private java.math.BigDecimal amount;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.occurredAt == null) {
            this.occurredAt = now;
        }
        this.createdAt = now;
    }
}