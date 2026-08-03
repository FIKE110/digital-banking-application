package com.bank.core.app.admin.approval;

import com.bank.common.dto.admin.AdminApprovalResponse;
import com.bank.common.dto.admin.ReviewApprovalRequest;
import com.bank.common.dto.admin.SubmitApprovalRequest;
import com.bank.common.enums.ApprovalStatus;
import com.bank.core.app.admin.AdminAuditService;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.approval.AdminApproval;
import com.bank.core.data.approval.AdminApprovalRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminApprovalService {

    private static final long EXPIRY_HOURS = 24;

    private final AdminApprovalRepository approvalRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final ObjectMapper objectMapper;
    private final AdminAuditService adminAuditService;
    private final List<ApprovalActionHandler> actionHandlers;

    @Transactional
    public AdminApprovalResponse submitApproval(SubmitApprovalRequest request, HttpServletRequest httpRequest) {
        User admin = securityUtil.currentUser();
        String payload;
        try {
            payload = objectMapper.writeValueAsString(request.getActionDetails());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize action details");
        }

        AdminApproval approval = AdminApproval.builder()
                .actionType(request.getActionType())
                .actionPayload(payload)
                .requestedBy(admin.getId())
                .status(ApprovalStatus.PENDING)
                .riskLevel(request.getRiskLevel())
                .reason(request.getReason())
                .correlationId(java.util.UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusHours(EXPIRY_HOURS))
                .build();

        AdminApproval saved = approvalRepository.save(approval);
        log.info("Approval {} requested by {} for action {}",
                saved.getId(), admin.getUsername(), request.getActionType());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<AdminApprovalResponse> listApprovals(String status, String actionType,
                                                       Pageable pageable) {
        Specification<AdminApproval> spec = Specification.where((root, query, cb) -> cb.conjunction());
        if (status != null && !status.isBlank()) {
            String s = status.toUpperCase();
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), s));
        }
        if (actionType != null && !actionType.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("actionType"), actionType));
        }
        return approvalRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminApprovalResponse getApproval(Long id) {
        AdminApproval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Approval not found: " + id));
        return mapToResponse(approval);
    }

    @Transactional
    public AdminApprovalResponse approve(Long id, ReviewApprovalRequest request,
                                         HttpServletRequest httpRequest) {
        User admin = securityUtil.currentUser();
        AdminApproval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Approval not found: " + id));

        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Approval is already " + approval.getStatus());
        }
        if (approval.getRequestedBy().equals(admin.getId())) {
            throw new IllegalStateException("You cannot approve your own request");
        }

        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setReviewedBy(admin.getId());
        approval.setReviewNote(request.getNote());

        boolean executed = false;
        String executeError = null;
        try {
            Map<String, Object> details = objectMapper.readValue(
                    approval.getActionPayload(), new tools.jackson.core.type.TypeReference<Map<String, Object>>() {
                    });
            executeAction(approval, details);
            executed = true;
        } catch (Exception e) {
            executeError = e.getMessage();
            log.error("Failed to execute approved action {}: {}", approval.getActionType(), e.getMessage());
        }

        AdminApproval saved = approvalRepository.save(approval);
        adminAuditService.auditWithCorrelation(
                com.bank.common.enums.AdminAuditEventType.MANUAL_TRANSFER_APPROVED,
                "APPROVAL", String.valueOf(saved.getId()), approval.getActionType(),
                "Approval approved by " + admin.getUsername() + (executeError != null ? " but execution failed: " + executeError : ""),
                saved.getCorrelationId(), httpRequest);
        return mapToResponse(saved);
    }

    @Transactional
    public AdminApprovalResponse reject(Long id, ReviewApprovalRequest request,
                                        HttpServletRequest httpRequest) {
        User admin = securityUtil.currentUser();
        AdminApproval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Approval not found: " + id));

        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Approval is already " + approval.getStatus());
        }
        if (approval.getRequestedBy().equals(admin.getId())) {
            throw new IllegalStateException("You cannot reject your own request");
        }

        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setReviewedBy(admin.getId());
        approval.setReviewNote(request.getNote());
        AdminApproval saved = approvalRepository.save(approval);
        log.warn("Approval {} rejected by {}", saved.getId(), admin.getUsername());
        return mapToResponse(saved);
    }

    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void expirePendingApprovals() {
        List<AdminApproval> expired = approvalRepository.findByStatusAndExpiresAtBefore(
                ApprovalStatus.PENDING.name(), LocalDateTime.now());
        for (AdminApproval approval : expired) {
            approval.setStatus(ApprovalStatus.EXPIRED);
            approvalRepository.save(approval);
            log.info("Approval {} expired", approval.getId());
        }
    }

    private void executeAction(AdminApproval approval, Map<String, Object> actionDetails) {
        for (ApprovalActionHandler handler : actionHandlers) {
            if (handler.supports(approval.getActionType())) {
                handler.execute(actionDetails);
                return;
            }
        }
        throw new IllegalStateException("No executor registered for action type: " + approval.getActionType());
    }

    private AdminApprovalResponse mapToResponse(AdminApproval approval) {
        User requester = userRepository.findById(approval.getRequestedBy()).orElse(null);
        User reviewer = approval.getReviewedBy() != null
                ? userRepository.findById(approval.getReviewedBy()).orElse(null)
                : null;
        return AdminApprovalResponse.builder()
                .id(approval.getId())
                .actionType(approval.getActionType())
                .actionPayload(approval.getActionPayload())
                .requestedBy(approval.getRequestedBy())
                .requestedByName(requester != null ? requester.getUsername() : null)
                .status(approval.getStatus().name())
                .reviewedBy(approval.getReviewedBy())
                .reviewedByName(reviewer != null ? reviewer.getUsername() : null)
                .reviewNote(approval.getReviewNote())
                .reason(approval.getReason())
                .riskLevel(approval.getRiskLevel())
                .correlationId(approval.getCorrelationId())
                .expiresAt(approval.getExpiresAt())
                .createdAt(approval.getCreatedAt())
                .build();
    }
}