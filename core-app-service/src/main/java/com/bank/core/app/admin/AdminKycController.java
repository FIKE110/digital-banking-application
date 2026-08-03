package com.bank.core.app.admin;

import com.bank.common.dto.admin.KycResponse;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/kyc")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage-admin')")
public class AdminKycController {

    private final AdminKycService kycService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<KycResponse>>> listKyc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String status) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess("KYC records fetched successfully",
                kycService.listKyc(status, pageable));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<KycResponse>> approveKyc(@PathVariable Long id,
                                                                HttpServletRequest request) {
        return ApiResponseUtil.buildSuccess("KYC approved", kycService.approveKyc(id, request));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<KycResponse>> rejectKyc(@PathVariable Long id,
                                                              @RequestBody(required = false) Map<String, String> body,
                                                              HttpServletRequest request) {
        String reason = body != null ? body.get("reason") : null;
        return ApiResponseUtil.buildSuccess("KYC rejected", kycService.rejectKyc(id, reason, request));
    }
}