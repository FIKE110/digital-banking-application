package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminUserResponse;
import com.bank.common.dto.admin.CreateAdminRequest;
import com.bank.common.dto.admin.UpdateAdminRolesRequest;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.role.Role;
import com.bank.core.data.role.RoleRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminAuditService adminAuditService;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> listAdmins(Pageable pageable) {
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream()
                        .anyMatch(r -> "ADMIN".equals(r.getRoleName())))
                .toList();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), admins.size());
        List<AdminUserResponse> content = start >= admins.size()
                ? List.of()
                : admins.subList(start, end).stream().map(this::mapToResponse).toList();
        return new PageImpl<>(content, pageable, admins.size());
    }

    @Transactional
    public AdminUserResponse createAdmin(CreateAdminRequest request, HttpServletRequest httpRequest) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Set<Role> roles = resolveRoles(request.getRoles());

        User admin = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .uid(com.github.f4b6a3.ulid.UlidCreator.getUlid().toString())
                .roles(roles)
                .permissions(Set.of())
                .build();
        User saved = userRepository.save(admin);

        adminAuditService.audit(AdminAuditEventType.ADMIN_CREATED, "ADMIN", String.valueOf(saved.getId()),
                saved.getUsername(), "Created admin with roles: " + request.getRoles(),
                httpRequest);
        return mapToResponse(saved);
    }

    @Transactional
    public AdminUserResponse updateAdminRoles(Long id, UpdateAdminRolesRequest request,
                                              HttpServletRequest httpRequest) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + id));
        String previous = admin.getRoles().stream().map(Role::getRoleName).collect(Collectors.joining(","));

        Set<Role> roles = resolveRoles(request.getRoles());
        if (roles.isEmpty()) {
            throw new IllegalArgumentException("Admin must have at least one role");
        }
        admin.setRoles(roles);
        User saved = userRepository.save(admin);

        adminAuditService.audit(AdminAuditEventType.ADMIN_ROLE_CHANGED, "ADMIN", String.valueOf(id),
                saved.getUsername(), "Roles changed from [" + previous + "] to " + request.getRoles(),
                previous, String.join(",", request.getRoles()), httpRequest);
        return mapToResponse(saved);
    }

    @Transactional
    public AdminUserResponse setAdminStatus(Long id, boolean enabled, HttpServletRequest httpRequest) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + id));
        admin.setDeleted(!enabled);
        User saved = userRepository.save(admin);

        if (enabled) {
            adminAuditService.audit(AdminAuditEventType.ADMIN_DISABLED, "ADMIN", String.valueOf(id),
                    saved.getUsername(), "Admin enabled", httpRequest);
        } else {
            adminAuditService.audit(AdminAuditEventType.ADMIN_DISABLED, "ADMIN", String.valueOf(id),
                    saved.getUsername(), "Admin disabled", httpRequest);
        }
        return mapToResponse(saved);
    }

    private Set<Role> resolveRoles(List<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        for (String name : roleNames) {
            roleRepository.findByName(name.toUpperCase()).ifPresent(roles::add);
        }
        if (roles.isEmpty()) {
            throw new IllegalArgumentException("No valid roles provided");
        }
        return roles;
    }

    private AdminUserResponse mapToResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.isDeleted() ? "DISABLED" : "ACTIVE")
                .roleNames(user.getRoles().stream().map(Role::getRoleName).toArray(String[]::new))
                .permissions(user.getPermissions().stream()
                        .map(p -> p.getPermissionName()).toArray(String[]::new))
                .createdAt(user.getCreatedAt())
                .lastLogoutDate(user.getLastLogoutDate())
                .build();
    }
}