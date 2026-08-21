package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdjustmentRequest;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.ledger.GlAccount;
import com.bank.core.app.ledger.JournalPosting;
import com.bank.core.app.ledger.LedgerLeg;
import com.bank.core.app.ledger.LedgerPostingService;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.ledger.LedgerSide;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAdjustmentService {

    private static boolean isInterest(String reason) {
        return reason != null && reason.toLowerCase().contains("interest");
    }

    private final AccountRepository accountRepository;
    private final AdminAuditService adminAuditService;
    private final LedgerPostingService ledgerPostingService;

    @Transactional
    public void manualCredit(AdjustmentRequest request) {
        executeAdjustment("MANUAL_CREDIT", request);
    }

    @Transactional
    public void manualDebit(AdjustmentRequest request) {
        executeAdjustment("MANUAL_DEBIT", request);
    }

    @Transactional
    public void balanceAdjustment(AdjustmentRequest request) {
        executeAdjustment("BALANCE_ADJUSTMENT", request);
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
            case "MANUAL_CREDIT" -> {
                account.setBalance(account.getBalance().add(request.getAmount()));
                postAdjustmentLedger("MANUAL_CREDIT", account, request);
            }
            case "MANUAL_DEBIT" -> {
                if (account.getBalance().compareTo(request.getAmount()) < 0) {
                    throw new IllegalStateException("Insufficient balance for debit adjustment");
                }
                account.setBalance(account.getBalance().subtract(request.getAmount()));
                postAdjustmentLedger("MANUAL_DEBIT", account, request);
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

    @Transactional
    public void postAdjustmentLedger(String actionType, Account account, AdjustmentRequest request) {
        String reference = request.getReference() != null && !request.getReference().isBlank()
                ? request.getReference()
                : java.util.UUID.randomUUID().toString();

        if ("MANUAL_CREDIT".equals(actionType)) {
            // Interest credited by an admin routes to the interest-expense GL;
            // other manual credits offset the float/suspense account.
            String gl = isInterest(request.getReason())
                    ? GlAccount.INTEREST_EXPENSE
                    : GlAccount.FLOAT;
            ledgerPostingService.post(new JournalPosting(reference, "Manual credit",
                    List.of(
                            LedgerLeg.gl(gl, LedgerSide.DEBIT, request.getAmount()),
                            LedgerLeg.customer(account.getAccountNumber(), LedgerSide.CREDIT, request.getAmount())
                    )));
        } else if ("MANUAL_DEBIT".equals(actionType)) {
            ledgerPostingService.post(new JournalPosting(reference, "Manual debit",
                    List.of(
                            LedgerLeg.customer(account.getAccountNumber(), LedgerSide.DEBIT, request.getAmount()),
                            LedgerLeg.gl(GlAccount.FLOAT, LedgerSide.CREDIT, request.getAmount())
                    )));
        }
    }
}