package com.bank.core.app.admin;

import com.bank.common.dto.admin.AccountTypeLimitResponse;
import com.bank.common.dto.admin.AdminAccountResponse;
import com.bank.common.dto.admin.AuditLogResponse;
import com.bank.common.dto.admin.UpdateAccountStatusRequest;
import com.bank.common.dto.admin.UpdateLimitsRequest;
import com.bank.common.enums.AccountStatus;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.admin.AccountTypeLimit;
import com.bank.core.data.admin.AccountTypeLimitRepository;
import com.bank.core.data.admin.AuditLog;
import com.bank.core.data.admin.AuditLogRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountTypeLimitRepository accountTypeLimitRepository;
    private final AuditLogRepository auditLogRepository;
    private final SecurityUtil securityUtil;
    private final AdminAuditService adminAuditService;

    @Override
    public Page<AdminAccountResponse> listAccounts(String status, Pageable pageable,
                                                    HttpServletRequest request) {
        Specification<Account> spec = null;
        if (status != null && !status.isBlank()) {
            spec = (root, query, cb) -> cb.equal(root.get("status"), status.toUpperCase());
        }

        adminAuditService.audit(AdminAuditEventType.CUSTOMER_VIEWED, "ACCOUNT", null,
                null, "Listed all accounts" + (status != null ? " with status " + status : ""), request);

        Page<Account> accounts = spec != null
                ? accountRepository.findAll(spec, pageable)
                : accountRepository.findAll(pageable);

        return accounts.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public AdminAccountResponse updateAccountStatus(UUID id, UpdateAccountStatusRequest request,
                                                     HttpServletRequest httpRequest) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + id));

        try {
            AccountStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + request.getStatus());
        }

        String previousStatus = account.getStatus();
        account.setStatus(request.getStatus().toUpperCase());
        Account updatedAccount = accountRepository.save(account);

        AdminAuditEventType eventType = determineStatusEventType(request.getStatus());
        adminAuditService.audit(eventType, "ACCOUNT", account.getId().toString(),
                account.getAccountName(),
                "Status changed from " + previousStatus + " to " + updatedAccount.getStatus(),
                previousStatus, updatedAccount.getStatus(), httpRequest);

        return mapToResponse(updatedAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AccountTypeLimitResponse> listLimits(Pageable pageable, HttpServletRequest request) {
        adminAuditService.audit(AdminAuditEventType.AUDIT_SEARCHED, "ACCOUNT_TYPE", null,
                null, "Listed account type limits", request);

        return accountTypeLimitRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public AccountTypeLimitResponse updateLimits(String accountType, UpdateLimitsRequest request,
                                                  HttpServletRequest httpRequest) {
        String type = accountType.toUpperCase();
        try {
            com.bank.common.enums.AccountType.valueOf(type);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid account type: " + accountType);
        }

        AccountTypeLimit limit = accountTypeLimitRepository.findByAccountType(type)
                .orElseGet(() -> AccountTypeLimit.builder().accountType(type).build());

        java.math.BigDecimal previousLimit = limit.getDailyTransferLimit();
        limit.setDailyTransferLimit(request.getDailyTransferLimit());
        AccountTypeLimit saved = accountTypeLimitRepository.save(limit);

        adminAuditService.audit(AdminAuditEventType.ACCOUNT_LIMIT_CHANGED, "ACCOUNT_TYPE", type,
                type,
                "Daily transfer limit changed from " + previousLimit + " to " + saved.getDailyTransferLimit(),
                String.valueOf(previousLimit), String.valueOf(saved.getDailyTransferLimit()),
                httpRequest);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    private AdminAuditEventType determineStatusEventType(String status) {
        return switch (status.toUpperCase()) {
            case "FROZEN" -> AdminAuditEventType.ACCOUNT_FROZEN;
            case "ACTIVE" -> AdminAuditEventType.ACCOUNT_UNFROZEN;
            case "CLOSED" -> AdminAuditEventType.ACCOUNT_CLOSED;
            default -> AdminAuditEventType.ACCOUNT_STATUS_CHANGED;
        };
    }

    private AccountTypeLimitResponse mapToResponse(AccountTypeLimit limit) {
        return AccountTypeLimitResponse.builder()
                .accountType(limit.getAccountType())
                .dailyTransferLimit(limit.getDailyTransferLimit())
                .updatedAt(limit.getUpdatedAt())
                .build();
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .detail(log.getDetail())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private AdminAccountResponse mapToResponse(Account account) {
        AdminAccountResponse.AdminAccountResponseBuilder builder = AdminAccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .status(account.getStatus())
                .userId(account.getUserId())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt());

        userRepository.findById(account.getUserId()).ifPresent(user -> {
            builder.username(user.getUsername());
            builder.email(user.getEmail());
        });

        return builder.build();
    }
}
