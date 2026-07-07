package com.bank.core.app.account.accountService;

import com.bank.common.dto.account.CreateAccountRequest;
import com.bank.core.app.account.AccountInfo.AccountInfo;
import com.bank.core.data.model.Account;

import java.util.List;
import java.util.UUID;

public interface AccountService {

    AccountInfo create(CreateAccountRequest request);

    List<AccountInfo> findAll();

    AccountInfo findById(UUID id);

    String getBalance(UUID id);

    AccountInfo updateStatus(UUID id, String status);
}
