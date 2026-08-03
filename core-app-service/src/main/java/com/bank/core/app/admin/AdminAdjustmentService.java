package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdjustmentRequest;
import com.bank.common.dto.admin.AdminApprovalResponse;
import com.bank.common.dto.admin.SubmitApprovalRequest;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.admin.approval.AdminApprovalService;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAdjustmentService {

    private static final BigDecimal APPROVAL_THRESHOLD = new BigDecimal("1000000.00");

    private final AccountRepository accountRepository;
    private final AdminApprovalService approvalService;
    private final AdminAuditService adminAuditService;

    public AdminApprovalResponse manualCredit(AdjustmentRequest request, HttpServletRequest httpRequest) {
        accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + request.getAccountNumber()));
        return submitOrExecute("MANUAL_CREDIT", request,
                request.getAmount().compareTo(APPROVAL_THRESHOLD) >= 0, httpRequest);
    }

    public AdminApprovalResponse manualDebit(AdjustmentRequest request, HttpServletRequest httpRequest) {
        accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + request.getAccountNumber()));
        return submitOrExecute("MANUAL_DEBIT", request,
                request.getAmount().compareTo(APPROVAL_THRESHOLD) >= 0, httpRequest);
    }

    public AdminApprovalResponse balanceAdjustment(AdjustmentRequest request, HttpServletRequest httpRequest) {
        accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + request.getAccountNumber()));
        return submitOrExecute("BALANCE_ADJUSTMENT", request, true, httpRequest);
    }

    private AdminApprovalResponse submitOrExecute(String actionType, AdjustmentRequest request,
                                                  boolean needsApproval, HttpServletRequest httpRequest) {
        if (needsApproval) {
            SubmitApprovalRequest approvalRequest = SubmitApprovalRequest.builder()
                    .actionType(actionType)
                    .actionDetails(buildActionDetails(actionType, request))
                    .riskLevel("CRITICAL")
                    .reason(request.getReason())
                    .build();
            return approvalService.submitApproval(approvalRequest, httpRequest);
        }
        executeAdjustment(actionType, request);
        return null;
    }

    private Map<String, Object> buildActionDetails(String actionType, AdjustmentRequest request) {
        Map<String, Object> details = new HashMap<>();
        details.put("actionType", actionType);
        details.put("accountNumber", request.getAccountNumber());
        details.put("amount", request.getAmount().toPlainString());
        details.put("reason", request.getReason());
        details.put("reference", request.getReference());
        return details;
    }

    @Transactional
    public void executeAdjustment(String actionType, AdjustmentRequest request) {
        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + request.getAccountNumber()));

        AdminAuditEventType eventType = switch (actionType) {
            case "MANUAL_CREDIT" -> AdminAuditEventType.MANUAL_CREDIT;
            case "MANUAL_DEBIT" -> AdminAuditEventType.MANUAL_DEBIT;
            case "BALANCE_ADJUSTMENT" -> AdminAuditEventType.BALANCE_ADJUSTED;
            default -> null;
        };

        switch (actionType) {
            case "MANUAL_CREDIT" -> account.setBalance(account.getBalance().add(request.getAmount()));
            case "MANUAL_DEBIT" -> {
                if (account.getBalance().compareTo(request.getAmount()) < 0) {
                    throw new IllegalStateException("Insufficient balance for debit adjustment");
                }
                account.setBalance(account.getBalance().subtract(request.getAmount()));
            }
            case "BALANCE_ADJUSTMENT" -> account.setBalance(request.getAmount());
            default -> throw new IllegalArgumentException("Unknown adjustment type: " + actionType);
        }
        Account saved = accountRepository.save(account);

        if (eventType != null) {
            adminAuditService.audit(eventType, "ACCOUNT", account.getId().toString(),
                    account.getAccountName(),
                    "Adjustment " + actionType + " of " + request.getAmount()
                            + " - " + request.getReason(),
                    null, saved.getBalance().toPlainString(), request.getAmount(), null);
        }
        log.info("Adjustment {} of {} on account {} executed",
                actionType, request.getAmount(), request.getAccountNumber());
    }
}