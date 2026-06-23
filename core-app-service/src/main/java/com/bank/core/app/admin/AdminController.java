package com.bank.core.app.admin;

import org.springframework.web.bind.annotation.*;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE)
public class AdminController {

    @GetMapping("/accounts")
    public String listAccounts() {
        return "ADMIN_ACCOUNTS_FETCHED";
    }

    @PatchMapping("/accounts/{id}/status")
    public String updateAccountStatus(@PathVariable String id) {
        return "ADMIN_ACCOUNT_STATUS_UPDATED";
    }

    @PutMapping("/limits/{accountType}")
    public String updateLimits(@PathVariable String accountType) {
        return "LIMITS_UPDATED";
    }

    @GetMapping("/audit-logs")
    public String auditLogs() {
        return "AUDIT_LOGS_FETCHED";
    }
}
