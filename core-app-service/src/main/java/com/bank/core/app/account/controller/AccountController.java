package com.bank.core.app.account.controller;

import com.bank.common.dto.account.AccountBalanceResponse;
import com.bank.common.dto.account.AccountListResponse;
import com.bank.common.dto.account.AccountResponse;
import com.bank.common.dto.account.CreateAccountRequest;
import com.bank.common.dto.account.UpdateAccountStatusRequest;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import com.bank.core.app.account.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static com.bank.common.constant.ApiConstant.ACCOUNT_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ACCOUNT_BASE)
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> create(@Valid @RequestBody CreateAccountRequest request) {
        AccountResponse response = accountService.create(request);
        return ApiResponseUtil.buildSuccess(HttpStatus.CREATED.value(), "Account created successfully", response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountListResponse>>> list() {
        List<AccountListResponse> accounts = accountService.findAll();
        return ApiResponseUtil.buildSuccess("Accounts retrieved successfully", accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> get(@PathVariable(name = "id") UUID id) {
        AccountResponse account = accountService.findById(id);
        return ApiResponseUtil.buildSuccess("Account retrieved successfully", account);
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<ApiResponse<AccountBalanceResponse>> getBalance(@PathVariable UUID id) {
        AccountBalanceResponse balance = accountService.getBalance(id);
        return ApiResponseUtil.buildSuccess("Balance retrieved successfully", balance);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AccountResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAccountStatusRequest request) {
        AccountResponse updated = accountService.updateStatus(id, request);
        return ApiResponseUtil.buildSuccess("Account status updated successfully", updated);
    }

    @PatchMapping("/{id}/balance")
    public ResponseEntity<ApiResponse<AccountResponse>> updateBalance(
            @PathVariable UUID id,
            @RequestBody BigDecimal balance) {
        AccountResponse updated = accountService.updateBalance(id, balance);
        return ApiResponseUtil.buildSuccess("Account balance updated successfully", updated);
    }
}