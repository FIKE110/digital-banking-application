package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdjustmentRequest;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
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
    public ResponseEntity<ApiResponse<String>> manualCredit(@Valid @RequestBody AdjustmentRequest request) {
        adjustmentService.manualCredit(request);
        return ApiResponseUtil.buildSuccess("Manual credit executed successfully", "CREDITED");
    }

    @PostMapping("/debit")
    public ResponseEntity<ApiResponse<String>> manualDebit(@Valid @RequestBody AdjustmentRequest request) {
        adjustmentService.manualDebit(request);
        return ApiResponseUtil.buildSuccess("Manual debit executed successfully", "DEBITED");
    }

    @PostMapping("/balance")
    public ResponseEntity<ApiResponse<String>> balanceAdjustment(@Valid @RequestBody AdjustmentRequest request) {
        adjustmentService.balanceAdjustment(request);
        return ApiResponseUtil.buildSuccess("Balance adjustment executed successfully", "ADJUSTED");
    }
}