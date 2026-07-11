package com.bank.core.app.ledger;

import com.bank.common.dto.transaction.TransactionResponse;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.transaction.Transaction;
import com.bank.core.data.transaction.TransactionRepository;
import com.bank.core.data.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LedgerServiceImpl implements LedgerService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final com.bank.core.data.user.UserRepository userRepository;

    @Override
    public List<TransactionResponse> getTransactions() {
        User currentUser = getCurrentUser();
        List<Account> userAccounts = accountRepository.findByUserId(currentUser.getId());
        List<String> accountNumbers = userAccounts.stream()
                .map(Account::getAccountNumber)
                .collect(Collectors.toList());

        if (accountNumbers.isEmpty()) {
            return List.of();
        }

        return transactionRepository.findByAccountNumberInOrderByCreatedAtDesc(accountNumbers)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TransactionResponse getTransaction(UUID id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

        verifyOwnership(transaction);

        return mapToResponse(transaction);
    }

    @Override
    public List<TransactionResponse> getAccountEntries(String accountNumber) {
        User currentUser = getCurrentUser();

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountNumber));

        if (!account.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Account does not belong to current user");
        }

        return transactionRepository.findByAccountNumberOrderByCreatedAtDesc(accountNumber)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void verifyOwnership(Transaction transaction) {
        User currentUser = getCurrentUser();
        Account account = accountRepository.findByAccountNumber(transaction.getAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!account.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized access to transaction");
        }
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .reference(transaction.getReference())
                .accountNumber(transaction.getAccountNumber())
                .counterpartyAccountNumber(transaction.getCounterpartyAccountNumber())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .description(transaction.getDescription())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
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
        } else {
            // Fallback: try to get user by username from security context
            String username = authentication.getName();
            return userRepository.findByUsernameOrEmailOrUid(username)
                    .orElseThrow(() -> new IllegalStateException("User not found: " + username));
        }
    }
}