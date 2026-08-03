package com.bank.core.app.admin.approval;

import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.transaction.Transaction;
import com.bank.core.data.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionReversalHandler implements ApprovalActionHandler {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @Override
    public boolean supports(String actionType) {
        return "TRANSACTION_REVERSAL".equalsIgnoreCase(actionType);
    }

    @Override
    @Transactional
    public void execute(Map<String, Object> actionDetails) {
        String transactionId = (String) actionDetails.get("transactionId");
        Transaction t = transactionRepository.findById(UUID.fromString(transactionId))
                .orElseThrow(() -> new IllegalStateException("Transaction not found: " + transactionId));

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

        t.setStatus("REVERSED");
        transactionRepository.save(t);

        Transaction reversal = Transaction.builder()
                .reference("REV-" + t.getReference())
                .accountNumber(t.getAccountNumber())
                .counterpartyAccountNumber(t.getCounterpartyAccountNumber())
                .amount(t.getAmount())
                .type(t.getType().equalsIgnoreCase("DEBIT") ? "CREDIT" : "DEBIT")
                .description("Reversal of transfer: " + t.getReference())
                .status("COMPLETED")
                .build();
        transactionRepository.save(reversal);

        log.info("Transaction {} reversed on account {}", t.getReference(), t.getAccountNumber());
    }
}