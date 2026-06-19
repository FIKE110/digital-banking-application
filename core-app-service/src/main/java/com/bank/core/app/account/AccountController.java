package com.bank.core.app.account;

import org.springframework.web.bind.annotation.*;

import static com.bank.common.constant.ApiConstant.ACCOUNT_BASE;

@RestController
@RequestMapping(ACCOUNT_BASE)
public class AccountController {

    @PostMapping
    public String create() {
        return "ACCOUNT_CREATED";
    }

    @GetMapping
    public String list() {
        return "ACCOUNTS_FETCHED";
    }

    @GetMapping("/{id}")
    public String get(@PathVariable String id) {
        return "ACCOUNT_FETCHED";
    }

    @GetMapping("/{id}/balance")
    public String balance(@PathVariable String id) {
        return "BALANCE_FETCHED";
    }

    @PatchMapping("/{id}/status")
    public String updateStatus(@PathVariable String id) {
        return "ACCOUNT_STATUS_UPDATED";
    }
}
