package com.bank.core.app.account.accountService;

import com.bank.common.dto.account.CreateAccountRequest;
import com.bank.core.app.account.AccountInfo.AccountInfo;
import com.bank.core.app.account.accountRepository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

//TODO Proper mapping of dto and responses

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    @Override
    public AccountInfo create(CreateAccountRequest request) {
        request.setCreatedAt(LocalDateTime.now());
        request.setStatus("ACTIVE");

        AccountInfo entity = AccountInfo.builder()
                .accountNumber(null)
                .accountName(request.getAccountName())
                .status(request.getStatus())
                .build();

        AccountInfo saved = accountRepository.save(entity);
        return saved;
    }

    @Override
    public List<AccountInfo> findAll() {
        return accountRepository.findAll();
    }

    @Override
    public AccountInfo findById(UUID id) {
        return accountRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Account not found with id: " + id));
    }

    @Override
    public String getBalance(UUID id) {
        AccountInfo account = findById(id);
        return account.getBalance().toPlainString();
    }

    @Override
    public AccountInfo updateStatus(UUID id, String status) {
        AccountInfo account = findById(id);

        account.setStatus(status);
        account.setUpdatedAt(LocalDateTime.now());

        return accountRepository.save(account);
    }
}

