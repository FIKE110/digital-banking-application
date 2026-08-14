package com.bank.core.app.transfer;

import com.bank.common.dto.transfer.ResolvedAccountResponse;
import com.bank.common.dto.transfer.TransferRequest;
import com.bank.common.dto.transfer.TransferResponse;
import com.bank.common.util.IdGenerator;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.transaction.Transaction;
import com.bank.core.data.transaction.TransactionRepository;
import com.bank.core.data.transfer.Transfer;
import com.bank.core.data.transfer.TransferRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import com.bank.core.app.notification.NotificationService;
import com.bank.core.app.outbox.OutboxService;
import com.bank.core.app.pin.PinService;
import tools.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransferServiceImpl implements TransferService {

    private final TransferRepository transferRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final OutboxService outboxService;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final PinService pinService;

    @Override
    @Transactional
    public TransferResponse initiate(TransferRequest request) {
        User currentUser = getCurrentUser();

        // Idempotency: replay the same request returns the original transfer
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            Transfer existing = transferRepository
                    .findBySourceAccountNumberAndIdempotencyKey(
                            request.getSourceAccountNumber(), request.getIdempotencyKey())
                    .orElse(null);
            if (existing != null) {
                log.info("Replayed transfer request with idempotency key {} — returning existing transfer {}",
                        request.getIdempotencyKey(), existing.getReference());
                return mapToResponse(existing);
            }
        }

        // Verify transaction PIN
        if (request.getPin() == null || request.getPin().isBlank()) {
            throw new IllegalArgumentException("Transaction PIN is required to send money");
        }
        pinService.verifyPin(new com.bank.common.dto.pin.VerifyPinRequest(request.getPin()));

        // Validate accounts are different
        if (request.getSourceAccountNumber().equals(request.getDestinationAccountNumber())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        // Find and validate source account
        Account sourceAccount = accountRepository.findByAccountNumber(request.getSourceAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Source account not found: " + request.getSourceAccountNumber()));

        // Verify source account belongs to current user
        if (!sourceAccount.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Source account does not belong to the current user");
        }

        // Validate source account is active
        if (!"ACTIVE".equals(sourceAccount.getStatus())) {
            throw new IllegalArgumentException("Source account is not active");
        }

        // Find and validate destination account
        Account destAccount = accountRepository.findByAccountNumber(request.getDestinationAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Destination account not found: " + request.getDestinationAccountNumber()));

        if (!"ACTIVE".equals(destAccount.getStatus())) {
            throw new IllegalArgumentException("Destination account is not active");
        }

        // Validate sufficient balance
        BigDecimal amount = request.getAmount();
        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        // Generate reference
        String reference = IdGenerator.generateUlid();

        // Debit source, credit destination
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));
        destAccount.setBalance(destAccount.getBalance().add(amount));

        accountRepository.save(sourceAccount);
        accountRepository.save(destAccount);

        // Create transfer record
        Transfer transfer = Transfer.builder()
                .reference(reference)
                .sourceAccountNumber(request.getSourceAccountNumber())
                .destinationAccountNumber(request.getDestinationAccountNumber())
                .amount(amount)
                .description(request.getDescription())
                .idempotencyKey(request.getIdempotencyKey())
                .status("COMPLETED")
                .build();

        Transfer savedTransfer = transferRepository.save(transfer);

        // Create transaction ledger entries
        createTransactionEntries(reference, sourceAccount, destAccount, amount,
                request.getDescription(), "COMPLETED");

        // Emit outbox event for source user (debit notification)
        emitTransferEvent(sourceAccount, currentUser, amount, "debit", sourceAccount.getBalance(), reference);

        // Emit outbox event for destination user (credit notification)
        User destUser = userRepository.findById(destAccount.getUserId()).orElse(null);
        if (destUser != null) {
            emitTransferEvent(destAccount, destUser, amount, "credit", destAccount.getBalance(), reference);
        }

        notificationService.notify(currentUser.getId(), "DEBIT", "Transfer sent",
                amount + " " + sourceAccount.getCurrency() + " sent to account "
                        + request.getDestinationAccountNumber() + (request.getDescription() != null
                        && !request.getDescription().isBlank() ? " · " + request.getDescription() : ""));
        if (destUser != null) {
            notificationService.notify(destUser.getId(), "CREDIT", "Money received",
                    amount + " " + destAccount.getCurrency() + " received from account "
                            + request.getSourceAccountNumber());
        }

        return mapToResponse(savedTransfer);
    }

    @Override
    public List<TransferResponse> findAll() {
        User currentUser = getCurrentUser();
        List<Account> userAccounts = accountRepository.findByUserId(currentUser.getId());
        List<String> accountNumbers = userAccounts.stream()
                .map(Account::getAccountNumber)
                .collect(Collectors.toList());

        if (accountNumbers.isEmpty()) {
            return List.of();
        }

        List<Transfer> transfers = transferRepository.findByAccountNumbers(accountNumbers);
        return transfers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TransferResponse findById(UUID id) {
        Transfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found: " + id));

        // Verify user is involved in this transfer
        User currentUser = getCurrentUser();
        List<Account> userAccounts = accountRepository.findByUserId(currentUser.getId());
        boolean isInvolved = userAccounts.stream().anyMatch(
                acc -> acc.getAccountNumber().equals(transfer.getSourceAccountNumber())
                        || acc.getAccountNumber().equals(transfer.getDestinationAccountNumber()));

        if (!isInvolved) {
            throw new SecurityException("Unauthorized access to transfer");
        }

        return mapToResponse(transfer);
    }

    @Override
    public ResolvedAccountResponse resolveAccount(String accountNumber) {
        if (accountNumber == null || accountNumber.isBlank()) {
            throw new IllegalArgumentException("Account number is required");
        }
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountNumber));
        if (!"ACTIVE".equals(account.getStatus())) {
            throw new IllegalArgumentException("Account is not active");
        }
        return ResolvedAccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .currency(account.getCurrency())
                .status(account.getStatus())
                .transferable(true)
                .build();
    }

    @Override
    @Transactional
    public TransferResponse reverse(UUID id) {
        // Find original transfer
        Transfer originalTransfer = transferRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found: " + id));

        // Verify ownership (only source user can reverse)
        User currentUser = getCurrentUser();
        Account sourceAccount = accountRepository.findByAccountNumber(originalTransfer.getSourceAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("Source account not found"));

        if (!sourceAccount.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Only the sender can reverse a transfer");
        }

        // Validate transfer is completed
        if (!"COMPLETED".equals(originalTransfer.getStatus())) {
            throw new IllegalArgumentException("Transfer cannot be reversed in its current state");
        }

        // Find accounts
        Account destAccount = accountRepository.findByAccountNumber(originalTransfer.getDestinationAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("Destination account not found"));

        // Validate destination has sufficient balance for reversal
        BigDecimal amount = originalTransfer.getAmount();
        if (destAccount.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance in destination account for reversal");
        }

        // Generate reversal reference
        String reversalRef = "Reversal: " + originalTransfer.getReference();

        // Reverse the balances (debit destination, credit source)
        destAccount.setBalance(destAccount.getBalance().subtract(amount));
        sourceAccount.setBalance(sourceAccount.getBalance().add(amount));

        accountRepository.save(destAccount);
        accountRepository.save(sourceAccount);

        // Mark original as reversed
        originalTransfer.setStatus("REVERSED");
        transferRepository.save(originalTransfer);

        // Create reversal transfer record
        Transfer reversalTransfer = Transfer.builder()
                .reference(reversalRef)
                .sourceAccountNumber(originalTransfer.getDestinationAccountNumber())
                .destinationAccountNumber(originalTransfer.getSourceAccountNumber())
                .amount(amount)
                .description("Reversal of transfer: " + originalTransfer.getReference()
                        + (originalTransfer.getDescription() != null ? " (" + originalTransfer.getDescription() + ")" : ""))
                .status("REVERSAL")
                .build();

        Transfer savedReversal = transferRepository.save(reversalTransfer);

        // Create transaction ledger entries for reversal
        createTransactionEntries(reversalRef, destAccount, sourceAccount, amount,
                "Reversal: " + originalTransfer.getReference(), "REVERSAL");

        // Emit outbox event for reversal notification
        emitTransferEvent(sourceAccount, currentUser, amount, "reversal", sourceAccount.getBalance(), reversalRef);

        return mapToResponse(savedReversal);
    }

    private void createTransactionEntries(String reference, Account sourceAccount, Account destAccount,
                                           BigDecimal amount, String description, String status) {
        // Debit entry for source account
        Transaction debitEntry = Transaction.builder()
                .reference(reference)
                .accountNumber(sourceAccount.getAccountNumber())
                .counterpartyAccountNumber(destAccount.getAccountNumber())
                .amount(amount)
                .type("DEBIT")
                .description(description)
                .status(status)
                .build();
        transactionRepository.save(debitEntry);

        // Credit entry for destination account
        Transaction creditEntry = Transaction.builder()
                .reference(reference)
                .accountNumber(destAccount.getAccountNumber())
                .counterpartyAccountNumber(sourceAccount.getAccountNumber())
                .amount(amount)
                .type("CREDIT")
                .description(description)
                .status(status)
                .build();
        transactionRepository.save(creditEntry);
    }

    private void emitTransferEvent(Account account, User user, BigDecimal amount,
                                    String type, BigDecimal newBalance, String reference) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", user.getEmail());
            payload.put("name", user.getUsername());
            payload.put("amount", amount.toPlainString());
            payload.put("type", type);
            payload.put("balance", newBalance.toPlainString());

            outboxService.saveEvent("TRANSFER", reference, "TRANSACTION_COMPLETED",
                    objectMapper.writeValueAsString(payload),
                    LocalDateTime.now().plusMinutes(30));
        } catch (Exception e) {
            log.error("Failed to emit transfer outbox event: {}", e.getMessage());
        }
    }

    private TransferResponse mapToResponse(Transfer transfer) {
        return TransferResponse.builder()
                .id(transfer.getId())
                .reference(transfer.getReference())
                .sourceAccountNumber(transfer.getSourceAccountNumber())
                .destinationAccountNumber(transfer.getDestinationAccountNumber())
                .amount(transfer.getAmount())
                .description(transfer.getDescription())
                .status(transfer.getStatus())
                .createdAt(transfer.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }

        String username = authentication.getName();
        return userRepository.findByUsernameOrEmailOrUid(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));
    }
}