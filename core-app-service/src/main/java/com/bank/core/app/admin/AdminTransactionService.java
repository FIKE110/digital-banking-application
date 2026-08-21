package com.bank.core.app.admin;

import com.bank.common.dto.transaction.TransactionResponse;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.transaction.Transaction;
import com.bank.core.data.transaction.TransactionRepository;
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
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminTransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AdminAuditService adminAuditService;
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

    @Transactional
    public TransactionResponse reverseTransaction(UUID id, String reason, HttpServletRequest httpRequest) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

        if (!"COMPLETED".equalsIgnoreCase(t.getStatus())) {
            throw new IllegalStateException("Only completed transactions can be reversed");
        }

        Account account = accountRepository.findByAccountNumber(t.getAccountNumber())
                .orElseThrow(() -> new IllegalStateException("Account not found: " + t.getAccountNumber()));

        if ("DEBIT".equalsIgnoreCase(t.getType())) {
            account.setBalance(account.getBalance().add(t.getAmount()));
        } else if ("CREDIT".equalsIgnoreCase(t.getType())) {
            account.setBalance(account.getBalance().subtract(t.getAmount()));
        }
        accountRepository.save(account);

        String previousStatus = t.getStatus();
        t.setStatus("REVERSED");
        transactionRepository.save(t);

        Transaction reversal = Transaction.builder()
                .reference("REV-" + t.getReference())
                .accountNumber(t.getAccountNumber())
                .counterpartyAccountNumber(t.getCounterpartyAccountNumber())
                .amount(t.getAmount())
                .type(t.getType().equalsIgnoreCase("DEBIT") ? "CREDIT" : "DEBIT")
                .description("Reversal of transaction: " + t.getReference()
                        + (reason != null && !reason.isBlank() ? " (" + reason + ")" : ""))
                .status("COMPLETED")
                .build();
        Transaction saved = transactionRepository.save(reversal);

        adminAuditService.audit(AdminAuditEventType.TRANSACTION_REVERSED, "TRANSACTION",
                id.toString(), t.getReference(),
                "Transaction reversed" + (reason != null && !reason.isBlank() ? " - " + reason : ""),
                previousStatus, "REVERSED", httpRequest);
        log.info("Transaction {} reversed on account {} by {}",
                t.getReference(), t.getAccountNumber(), getCurrentAdmin());

        return mapToResponse(saved);
    }

    @Transactional
    public TransactionResponse refundTransaction(UUID id, String reason, HttpServletRequest httpRequest) {
        Transaction original = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

        Account account = accountRepository.findByAccountNumber(original.getAccountNumber())
                .orElseThrow(() -> new IllegalStateException("Account not found: " + original.getAccountNumber()));

        BigDecimal amount = original.getAmount();
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        String previousStatus = original.getStatus();
        original.setStatus("REFUNDED");
        transactionRepository.save(original);

        Transaction refund = Transaction.builder()
                .reference("REF-" + original.getReference())
                .accountNumber(original.getAccountNumber())
                .counterpartyAccountNumber(original.getCounterpartyAccountNumber())
                .amount(amount)
                .type("CREDIT")
                .description("Refund for transaction: " + original.getReference()
                        + (reason != null && !reason.isBlank() ? " (" + reason + ")" : ""))
                .status("COMPLETED")
                .build();
        Transaction saved = transactionRepository.save(refund);

        adminAuditService.audit(AdminAuditEventType.REFUND_PROCESSED, "TRANSACTION",
                id.toString(), original.getReference(),
                "Transaction refunded" + (reason != null && !reason.isBlank() ? " - " + reason : ""),
                previousStatus, "REFUNDED", httpRequest);
        log.info("Transaction {} refunded to account {} by {}",
                original.getReference(), original.getAccountNumber(), getCurrentAdmin());

        return mapToResponse(saved);
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

    private String getCurrentAdmin() {
        try {
            return securityUtil.currentUser().getUsername();
        } catch (Exception e) {
            return "unknown";
        }
    }
}