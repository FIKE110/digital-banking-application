package com.bank.core.app.ledger;

import com.bank.common.dto.transaction.TransactionResponse;
import com.bank.common.wrapper.PaginatedResponse;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.transaction.Transaction;
import com.bank.core.data.transaction.TransactionRepository;
import com.bank.core.data.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.bank.common.constant.ApiConstant.MAX_PAGE_SIZE;

@Service
@RequiredArgsConstructor
public class LedgerServiceImpl implements LedgerService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final com.bank.core.data.user.UserRepository userRepository;

    @Override
    public PaginatedResponse<TransactionResponse> getTransactions(int page, int size, String type,
                                                                  String accountNumber,
                                                                  LocalDateTime from, LocalDateTime to, String search) {
        User currentUser = getCurrentUser();
        List<Account> userAccounts = accountRepository.findByUserId(currentUser.getId());
        List<String> accountNumbers = userAccounts.stream()
                .map(Account::getAccountNumber)
                .collect(Collectors.toList());

        if (accountNumber != null && !accountNumber.isBlank() && !accountNumbers.contains(accountNumber)) {
            throw new SecurityException("Unauthorized access to account");
        }

        if (accountNumbers.isEmpty()) {
            return PaginatedResponse.<TransactionResponse>builder()
                    .success("true")
                    .content(List.of())
                    .page(page)
                    .size(size)
                    .totalElements(0)
                    .totalPages(0)
                    .first(true)
                    .last(true)
                    .hasNext(false)
                    .hasPrevious(false)
                    .empty(true)
                    .build();
        }

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Transaction> result = transactionRepository.findAll(
                TransactionRepository.filters(type, from, to, search).and(
                        (root, query, cb) -> root.get("accountNumber").in(accountNumbers)),
                pageable);

        return PaginatedResponse.from(result.map(this::mapToResponse));
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