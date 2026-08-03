package com.bank.core.app.admin.approval;

import com.bank.common.dto.admin.AdminApprovalResponse;
import com.bank.common.dto.admin.ReviewApprovalRequest;
import com.bank.common.dto.admin.SubmitApprovalRequest;
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

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/approvals")
@RequiredArgsConstructor
public class AdminApprovalController {

    private final AdminApprovalService approvalService;

    @GetMapping
    @PreAuthorize("hasAuthority('manage-admin')")
    public ResponseEntity<ApiResponse<Page<AdminApprovalResponse>>> listApprovals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String actionType) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess("Approvals fetched successfully",
                approvalService.listApprovals(status, actionType, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('manage-admin')")
    public ResponseEntity<ApiResponse<AdminApprovalResponse>> getApproval(@PathVariable Long id) {
        return ApiResponseUtil.buildSuccess("Approval fetched successfully", approvalService.getApproval(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('manage-admin')")
    public ResponseEntity<ApiResponse<AdminApprovalResponse>> submitApproval(
            @Valid @RequestBody SubmitApprovalRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Approval submitted successfully",
                approvalService.submitApproval(request, httpRequest));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('approve-admin-actions')")
    public ResponseEntity<ApiResponse<AdminApprovalResponse>> approve(
            @PathVariable Long id,
            @Valid @RequestBody ReviewApprovalRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Approval approved and action executed",
                approvalService.approve(id, request, httpRequest));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('approve-admin-actions')")
    public ResponseEntity<ApiResponse<AdminApprovalResponse>> reject(
            @PathVariable Long id,
            @Valid @RequestBody ReviewApprovalRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Approval rejected", approvalService.reject(id, request, httpRequest));
    }
}