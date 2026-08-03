package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminUserResponse;
import com.bank.common.dto.admin.CreateAdminRequest;
import com.bank.common.dto.admin.UpdateAdminRolesRequest;
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

import java.util.Map;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/admins")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage-admin')")
public class AdminManagementController {

    private final AdminManagementService adminManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> listAdmins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("id"));
        return ApiResponseUtil.buildSuccess("Admins fetched successfully", adminManagementService.listAdmins(pageable));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminUserResponse>> createAdmin(
            @Valid @RequestBody CreateAdminRequest request, HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Admin created successfully",
                adminManagementService.createAdmin(request, httpRequest));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateAdminRoles(
            @PathVariable Long id, @Valid @RequestBody UpdateAdminRolesRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Admin roles updated",
                adminManagementService.updateAdminRoles(id, request, httpRequest));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> setAdminStatus(
            @PathVariable Long id, @RequestBody Map<String, Boolean> body,
            HttpServletRequest httpRequest) {
        boolean enabled = body.getOrDefault("enabled", true);
        return ApiResponseUtil.buildSuccess("Admin status updated",
                adminManagementService.setAdminStatus(id, enabled, httpRequest));
    }
}