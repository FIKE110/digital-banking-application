package com.bank.core.app.admin;

import com.bank.common.dto.admin.AssignPermissionsRequest;
import com.bank.common.dto.admin.CreateRoleRequest;
import com.bank.common.dto.admin.RoleResponse;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.role.Permission;
import com.bank.core.data.role.PermissionRepository;
import com.bank.core.data.role.Role;
import com.bank.core.data.role.RoleRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AdminAuditService adminAuditService;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public Page<RoleResponse> listRoles(Pageable pageable) {
        List<Role> roles = roleRepository.findAll();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), roles.size());
        List<RoleResponse> content = start >= roles.size()
                ? List.of()
                : roles.subList(start, end).stream().map(this::mapToResponse).toList();
        return new PageImpl<>(content, pageable, roles.size());
    }

    @Transactional(readOnly = true)
    public RoleResponse getRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + id));
        return mapToResponse(role);
    }

    @Transactional
    public RoleResponse createRole(CreateRoleRequest request, HttpServletRequest httpRequest) {
        if (roleRepository.findByName(request.getRoleName().toUpperCase()).isPresent()) {
            throw new IllegalArgumentException("Role already exists: " + request.getRoleName());
        }
        Role role = new Role();
        role.setRoleName(request.getRoleName().toUpperCase());
        role.setDescription(request.getDescription());
        role.setPermissions(resolvePermissions(request.getPermissions()));
        Role saved = roleRepository.save(role);

        adminAuditService.audit(AdminAuditEventType.ROLE_CREATED, "ROLE", String.valueOf(saved.getId()),
                saved.getRoleName(), "Role created with permissions: " + request.getPermissions(),
                httpRequest);
        return mapToResponse(saved);
    }

    @Transactional
    public RoleResponse updateRolePermissions(Long id, AssignPermissionsRequest request,
                                              HttpServletRequest httpRequest) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + id));
        Set<Permission> newPerms = resolvePermissions(request.getPermissions());
        role.setPermissions(newPerms);
        Role saved = roleRepository.save(role);

        adminAuditService.audit(AdminAuditEventType.PERMISSION_GRANTED, "ROLE", String.valueOf(saved.getId()),
                saved.getRoleName(), "Role permissions updated to: " + request.getPermissions(),
                httpRequest);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteRole(Long id, HttpServletRequest httpRequest) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + id));
        roleRepository.delete(role);
        adminAuditService.audit(AdminAuditEventType.ROLE_DELETED, "ROLE", String.valueOf(id),
                role.getRoleName(), "Role deleted", httpRequest);
    }

    private Set<Permission> resolvePermissions(List<String> permissionNames) {
        Set<Permission> permissions = new HashSet<>();
        for (String name : permissionNames) {
            permissionRepository.findByPermissionName(name).ifPresent(permissions::add);
        }
        if (permissions.isEmpty()) {
            throw new IllegalArgumentException("No valid permissions provided");
        }
        return permissions;
    }

    private RoleResponse mapToResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .permissions(role.getPermissions().stream()
                        .map(Permission::getPermissionName)
                        .sorted()
                        .collect(Collectors.toList()))
                .createdAt(role.getCreatedAt())
                .build();
    }
}