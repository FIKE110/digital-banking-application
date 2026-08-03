package com.bank.core.app.admin;

import com.bank.common.dto.admin.AccountTypeLimitResponse;
import com.bank.common.dto.admin.AdminAccountResponse;
import com.bank.common.dto.admin.AuditLogResponse;
import com.bank.common.dto.admin.UpdateAccountStatusRequest;
import com.bank.common.dto.admin.UpdateLimitsRequest;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResponse<Page<AdminAccountResponse>>> listAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess("Admin accounts fetched successfully",
                adminService.listAccounts(status, pageable, request));
    }

    @PatchMapping("/accounts/{id}/status")
    public ResponseEntity<ApiResponse<AdminAccountResponse>> updateAccountStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAccountStatusRequest request,
            HttpServletRequest httpRequest) {
        AdminAccountResponse updated = adminService.updateAccountStatus(id, request, httpRequest);
        return ApiResponseUtil.buildSuccess("Account status updated successfully", updated);
    }

    @GetMapping("/limits")
    public ResponseEntity<ApiResponse<Page<AccountTypeLimitResponse>>> listLimits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            HttpServletRequest request) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("accountType"));
        return ApiResponseUtil.buildSuccess("Limits fetched successfully",
                adminService.listLimits(pageable, request));
    }

    @PutMapping("/limits/{accountType}")
    public ResponseEntity<ApiResponse<AccountTypeLimitResponse>> updateLimits(
            @PathVariable String accountType,
            @Valid @RequestBody UpdateLimitsRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Limits updated successfully",
                adminService.updateLimits(accountType, request, httpRequest));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess("Audit logs fetched successfully",
                adminService.getAuditLogs(pageable));
    }
}
