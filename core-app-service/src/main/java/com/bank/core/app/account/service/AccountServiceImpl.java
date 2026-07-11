package com.bank.core.app.account.service;

import com.bank.common.dto.account.AccountBalanceResponse;
import com.bank.common.dto.account.AccountListResponse;
import com.bank.common.dto.account.AccountResponse;
import com.bank.common.dto.account.CreateAccountRequest;
import com.bank.common.dto.account.UpdateAccountStatusRequest;
import com.bank.common.enums.AccountStatus;
import com.bank.common.enums.AccountType;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public AccountResponse create(CreateAccountRequest request) {
        // Get current authenticated user
        User currentUser = getCurrentUser();

        // Validate account type
        AccountType accountType;
        try {
            accountType = AccountType.valueOf(request.getAccountType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid account type: " + request.getAccountType());
        }

        // Validate currency (3-letter code)
        String currency = request.getCurrency().toUpperCase();
        if (currency.length() != 3) {
            throw new IllegalArgumentException("Currency must be a 3-letter code");
        }

        // Validate status
        AccountStatus status;
        try {
            status = AccountStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid account status: " + request.getStatus());
        }

        // Generate unique 10-digit account number
        String accountNumber = generateUniqueAccountNumber();

        // Create account entity
        Account account = Account.builder()
                .accountNumber(accountNumber)
                .accountName(request.getAccountName())
                .accountType(request.getAccountType())
                .balance(request.getOpeningBalance())
                .currency(currency)
                .status(request.getStatus())
                .userId(currentUser.getId())
                .build();

        // Save account
        Account savedAccount = accountRepository.save(account);

        // Map to response DTO
        return AccountResponse.builder()
                .id(savedAccount.getId())
                .accountNumber(savedAccount.getAccountNumber())
                .accountName(savedAccount.getAccountName())
                .accountType(savedAccount.getAccountType())
                .balance(savedAccount.getBalance())
                .currency(savedAccount.getCurrency())
                .status(savedAccount.getStatus())
                .createdAt(savedAccount.getCreatedAt())
                .updatedAt(savedAccount.getUpdatedAt())
                .build();
    }

    @Override
    public List<AccountListResponse> findAll() {
        User currentUser = getCurrentUser();
        List<Account> accounts = accountRepository.findByUserId(currentUser.getId());

        return accounts.stream()
                .map(acc -> AccountListResponse.builder()
                        .id(acc.getId())
                        .accountNumber(acc.getAccountNumber())
                        .accountName(acc.getAccountName())
                        .accountType(acc.getAccountType())
                        .balance(acc.getBalance())
                        .status(acc.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public AccountResponse findById(UUID id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with id: " + id));

        // Optional: Verify ownership (only allow users to see their own accounts)
        User currentUser = getCurrentUser();
        if (!account.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized access to account");
        }

        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    @Override
    public AccountBalanceResponse getBalance(UUID id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with id: " + id));

        // Optional: Verify ownership
        User currentUser = getCurrentUser();
        if (!account.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized access to account");
        }

        return AccountBalanceResponse.builder()
                .accountId(account.getId())
                .accountNumber(account.getAccountNumber())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .build();
    }

    @Transactional
    @Override
    public AccountResponse updateStatus(UUID id, UpdateAccountStatusRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with id: " + id));

        // Optional: Verify ownership
        User currentUser = getCurrentUser();
        if (!account.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized access to account");
        }

        // Validate status
        AccountStatus status;
        try {
            status = AccountStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid account status: " + request.getStatus());
        }

            // Update status
         account.setStatus(status.name());
         Account updatedAccount = accountRepository.save(account);

         return AccountResponse.builder()
                 .id(updatedAccount.getId())
                 .accountNumber(updatedAccount.getAccountNumber())
                 .accountName(updatedAccount.getAccountName())
                 .accountType(updatedAccount.getAccountType())
                 .balance(updatedAccount.getBalance())
                 .currency(updatedAccount.getCurrency())
                 .status(updatedAccount.getStatus())
                 .createdAt(updatedAccount.getCreatedAt())
                 .updatedAt(updatedAccount.getUpdatedAt())
                 .build();
     }

     @Transactional
     @Override
     public AccountResponse updateBalance(UUID id, BigDecimal balance) {
         Account account = accountRepository.findById(id)
                 .orElseThrow(() -> new IllegalArgumentException("Account not found with id: " + id));

         // Optional: Verify ownership
         User currentUser = getCurrentUser();
         if (!account.getUserId().equals(currentUser.getId())) {
             throw new SecurityException("Unauthorized access to account");
         }

         // Update balance
         account.setBalance(balance);
         Account updatedAccount = accountRepository.save(account);

         return AccountResponse.builder()
                 .id(updatedAccount.getId())
                 .accountNumber(updatedAccount.getAccountNumber())
                 .accountName(updatedAccount.getAccountName())
                 .accountType(updatedAccount.getAccountType())
                 .balance(updatedAccount.getBalance())
                 .currency(updatedAccount.getCurrency())
                 .status(updatedAccount.getStatus())
                 .createdAt(updatedAccount.getCreatedAt())
                 .updatedAt(updatedAccount.getUpdatedAt())
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

    private String generateUniqueAccountNumber() {
        Random random = new Random();
        String accountNumber;
        do {
            // Generate 10-digit random number (ensuring it doesn't start with 0)
            int randomNum = 100000000 + random.nextInt(900000000); // 100,000,000 to 999,999,999
            accountNumber = String.valueOf(randomNum);
        } while (accountRepository.existsByAccountNumber(accountNumber));

        return accountNumber;
    }
}