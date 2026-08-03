package com.bank.core.data.approval;

import com.bank.common.enums.ApprovalStatus;
import com.bank.core.data.model.AuditModel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_approvals", indexes = {
        @Index(name = "idx_approval_status", columnList = "status"),
        @Index(name = "idx_approval_action_type", columnList = "actionType")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AdminApproval extends AuditModel {

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "action_payload", columnDefinition = "TEXT")
    private String actionPayload;

    @Column(name = "requested_by", nullable = false)
    private Long requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "review_note")
    private String reviewNote;

    @Column(name = "reason")
    private String reason;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel;

    @Column(name = "correlation_id")
    private String correlationId;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
