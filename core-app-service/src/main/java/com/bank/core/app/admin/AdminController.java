package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminAccountResponse;
import com.bank.common.dto.admin.UpdateAccountStatusRequest;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE)
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage-admin')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/accounts")
    public ResponseEntity<ApiResponse<List<AdminAccountResponse>>> listAccounts() {
        List<AdminAccountResponse> accounts = adminService.listAccounts();
        return ApiResponseUtil.buildSuccess("Admin accounts fetched successfully", accounts);
    }

    @PatchMapping("/accounts/{id}/status")
    public ResponseEntity<ApiResponse<AdminAccountResponse>> updateAccountStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAccountStatusRequest request) {
        AdminAccountResponse updated = adminService.updateAccountStatus(id, request);
        return ApiResponseUtil.buildSuccess("Account status updated successfully", updated);
    }

    @PutMapping("/limits/{accountType}")
    public ResponseEntity<ApiResponse<Void>> updateLimits(@PathVariable String accountType) {
        return ApiResponseUtil.buildSuccess("Limits updated successfully", null);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Void>> getAuditLogs() {
        return ApiResponseUtil.buildSuccess("Audit logs fetched successfully", null);
    }
}