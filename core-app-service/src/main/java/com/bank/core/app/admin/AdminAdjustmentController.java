package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdjustmentRequest;
import com.bank.common.dto.admin.AdminApprovalResponse;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/adjustments")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage-admin')")
public class AdminAdjustmentController {

    private final AdminAdjustmentService adjustmentService;

    @PostMapping("/credit")
    public ResponseEntity<ApiResponse<AdminApprovalResponse>> manualCredit(
            @Valid @RequestBody AdjustmentRequest request, HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Manual credit processed",
                adjustmentService.manualCredit(request, httpRequest));
    }

    @PostMapping("/debit")
    public ResponseEntity<ApiResponse<AdminApprovalResponse>> manualDebit(
            @Valid @RequestBody AdjustmentRequest request, HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Manual debit processed",
                adjustmentService.manualDebit(request, httpRequest));
    }

    @PostMapping("/balance")
    public ResponseEntity<ApiResponse<AdminApprovalResponse>> balanceAdjustment(
            @Valid @RequestBody AdjustmentRequest request, HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Balance adjustment submitted",
                adjustmentService.balanceAdjustment(request, httpRequest));
    }
}