package com.bank.core.app.admin;

import com.bank.common.dto.admin.AssignPermissionsRequest;
import com.bank.common.dto.admin.CreateRoleRequest;
import com.bank.common.dto.admin.RoleResponse;
import com.bank.common.dto.role.PermissionResponse;
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

import com.bank.core.data.role.Permission;
import com.bank.core.data.role.PermissionRepository;

import java.util.List;
import java.util.stream.Collectors;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/roles")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage-admin')")
public class AdminRoleController {

    private final AdminRoleService roleService;
    private final PermissionRepository permissionRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RoleResponse>>> listRoles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("roleName"));
        return ApiResponseUtil.buildSuccess("Roles fetched successfully", roleService.listRoles(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> getRole(@PathVariable Long id) {
        return ApiResponseUtil.buildSuccess("Role fetched successfully", roleService.getRole(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(
            @Valid @RequestBody CreateRoleRequest request, HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Role created successfully",
                roleService.createRole(request, httpRequest));
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRolePermissions(
            @PathVariable Long id, @Valid @RequestBody AssignPermissionsRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Role permissions updated",
                roleService.updateRolePermissions(id, request, httpRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteRole(@PathVariable Long id,
                                                          HttpServletRequest httpRequest) {
        roleService.deleteRole(id, httpRequest);
        return ApiResponseUtil.buildSuccess("Role deleted", null);
    }

    @GetMapping("/permissions/all")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> listPermissions() {
        List<PermissionResponse> perms = permissionRepository.findAll().stream()
                .map(p -> PermissionResponse.builder()
                        .id(p.getId())
                        .permissionName(p.getPermissionName())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList());
        return ApiResponseUtil.buildSuccess("Permissions fetched successfully", perms);
    }
}