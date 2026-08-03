package com.bank.core.app.account.service;

import com.bank.common.dto.account.AccountBalanceResponse;
import com.bank.common.dto.account.AccountListResponse;
import com.bank.common.dto.account.AccountResponse;
import com.bank.common.dto.account.CreateAccountRequest;
import com.bank.common.dto.account.DepositRequest;
import com.bank.common.dto.account.DepositResponse;
import com.bank.common.dto.account.UpdateAccountStatusRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface AccountService {

    AccountResponse create(CreateAccountRequest request);

    List<AccountListResponse> findAll();

    AccountResponse findById(UUID id);

    AccountBalanceResponse getBalance(UUID id);

    AccountResponse updateStatus(UUID id, UpdateAccountStatusRequest request);

    AccountResponse updateBalance(UUID id, BigDecimal balance);

    DepositResponse deposit(UUID id, DepositRequest request);
}