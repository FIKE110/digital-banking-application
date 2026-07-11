package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminAccountResponse;
import com.bank.common.dto.admin.UpdateAccountStatusRequest;
import com.bank.common.enums.AccountStatus;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Override
    public List<AdminAccountResponse> listAccounts() {
        List<Account> accounts = accountRepository.findAll();

        return accounts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AdminAccountResponse updateAccountStatus(UUID id, UpdateAccountStatusRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + id));

        try {
            AccountStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + request.getStatus());
        }

        account.setStatus(request.getStatus().toUpperCase());
        Account updatedAccount = accountRepository.save(account);

        return mapToResponse(updatedAccount);
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