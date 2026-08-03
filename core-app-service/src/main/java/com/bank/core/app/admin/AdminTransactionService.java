package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminApprovalResponse;
import com.bank.common.dto.admin.ReviewApprovalRequest;
import com.bank.common.dto.admin.SubmitApprovalRequest;
import com.bank.common.dto.transaction.TransactionResponse;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.admin.approval.AdminApprovalService;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.transaction.Transaction;
import com.bank.core.data.transaction.TransactionRepository;
import com.bank.core.data.user.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminTransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AdminAuditService adminAuditService;
    private final AdminApprovalService approvalService;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public Page<TransactionResponse> listTransactions(String accountNumber, String type, String status,
                                                       String fromDate, String toDate,
                                                       BigDecimal minAmount, BigDecimal maxAmount,
                                                       String search, Pageable pageable) {
        Specification<Transaction> spec = Specification.where((root, query, cb) -> cb.conjunction());

        if (accountNumber != null && !accountNumber.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("accountNumber"), accountNumber));
        }
        if (type != null && !type.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type.toUpperCase()));
        }
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status.toUpperCase()));
        }
        if (fromDate != null && !fromDate.isBlank()) {
            LocalDateTime from = LocalDateTime.parse(fromDate + "T00:00:00");
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (toDate != null && !toDate.isBlank()) {
            LocalDateTime to = LocalDateTime.parse(toDate + "T23:59:59");
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
        }
        if (minAmount != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
        }
        if (maxAmount != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
        }
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("reference")), "%" + q + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + q + "%"),
                    cb.like(cb.lower(root.get("accountNumber")), "%" + q + "%")
            ));
        }

        return transactionRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(UUID id) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        return mapToResponse(t);
    }

    public AdminApprovalResponse reverseTransaction(UUID id, String reason,
                                                    HttpServletRequest httpRequest) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

        Map<String, Object> details = new HashMap<>();
        details.put("transactionId", id.toString());
        details.put("reference", t.getReference());
        details.put("accountNumber", t.getAccountNumber());
        details.put("amount", t.getAmount().toPlainString());
        details.put("type", t.getType());
        details.put("reason", reason);

        SubmitApprovalRequest approvalRequest = SubmitApprovalRequest.builder()
                .actionType("TRANSACTION_REVERSAL")
                .actionDetails(details)
                .riskLevel("HIGH")
                .reason(reason)
                .build();
        return approvalService.submitApproval(approvalRequest, httpRequest);
    }

    public AdminApprovalResponse refundTransaction(UUID id, String reason,
                                                   HttpServletRequest httpRequest) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

        Map<String, Object> details = new HashMap<>();
        details.put("transactionId", id.toString());
        details.put("reference", t.getReference());
        details.put("accountNumber", t.getAccountNumber());
        details.put("amount", t.getAmount().toPlainString());
        details.put("reason", reason);

        SubmitApprovalRequest approvalRequest = SubmitApprovalRequest.builder()
                .actionType("TRANSACTION_REFUND")
                .actionDetails(details)
                .riskLevel("HIGH")
                .reason(reason)
                .build();
        return approvalService.submitApproval(approvalRequest, httpRequest);
    }

    @Transactional
    public TransactionResponse holdTransaction(UUID id, HttpServletRequest httpRequest) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        String previous = t.getStatus();
        t.setStatus("ON_HOLD");
        Transaction saved = transactionRepository.save(t);
        adminAuditService.audit(AdminAuditEventType.ACCOUNT_STATUS_CHANGED, "TRANSACTION",
                id.toString(), saved.getReference(),
                "Transaction placed on hold (was " + previous + ")",
                previous, saved.getStatus(), httpRequest);
        return mapToResponse(saved);
    }

    @Transactional
    public TransactionResponse releaseTransaction(UUID id, HttpServletRequest httpRequest) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        String previous = t.getStatus();
        t.setStatus("COMPLETED");
        Transaction saved = transactionRepository.save(t);
        adminAuditService.audit(AdminAuditEventType.ACCOUNT_STATUS_CHANGED, "TRANSACTION",
                id.toString(), saved.getReference(),
                "Transaction released from hold (was " + previous + ")",
                previous, saved.getStatus(), httpRequest);
        return mapToResponse(saved);
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .reference(t.getReference())
                .accountNumber(t.getAccountNumber())
                .counterpartyAccountNumber(t.getCounterpartyAccountNumber())
                .amount(t.getAmount())
                .type(t.getType())
                .description(t.getDescription())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .build();
    }
}