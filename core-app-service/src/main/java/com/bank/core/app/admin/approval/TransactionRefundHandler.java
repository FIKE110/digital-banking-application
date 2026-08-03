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
public class TransactionRefundHandler implements ApprovalActionHandler {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @Override
    public boolean supports(String actionType) {
        return "TRANSACTION_REFUND".equalsIgnoreCase(actionType);
    }

    @Override
    @Transactional
    public void execute(Map<String, Object> actionDetails) {
        String transactionId = (String) actionDetails.get("transactionId");
        Transaction original = transactionRepository.findById(UUID.fromString(transactionId))
                .orElseThrow(() -> new IllegalStateException("Transaction not found: " + transactionId));

        Account account = accountRepository.findByAccountNumber(original.getAccountNumber())
                .orElseThrow(() -> new IllegalStateException("Account not found: " + original.getAccountNumber()));

        BigDecimal amount = BigDecimal.valueOf(Double.parseDouble((String) actionDetails.get("amount")));
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        original.setStatus("REFUNDED");
        transactionRepository.save(original);

        Transaction refund = Transaction.builder()
                .reference("REF-" + original.getReference())
                .accountNumber(original.getAccountNumber())
                .counterpartyAccountNumber(original.getCounterpartyAccountNumber())
                .amount(amount)
                .type("CREDIT")
                .description("Refund for: " + original.getReference())
                .status("COMPLETED")
                .build();
        transactionRepository.save(refund);

        log.info("Transaction {} refunded to account {}", original.getReference(), original.getAccountNumber());
    }
}