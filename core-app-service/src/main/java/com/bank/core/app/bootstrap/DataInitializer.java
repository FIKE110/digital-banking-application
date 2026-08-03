package com.bank.core.app.bootstrap;

import com.bank.common.enums.AccountStatus;
import com.bank.core.data.role.Permission;
import com.bank.core.data.role.PermissionRepository;
import com.bank.core.data.role.Role;
import com.bank.core.data.role.RoleRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        createDefaultRolesAndPermissions();
        createDefaultAdmin();
    }

    private void createDefaultRolesAndPermissions() {
        // Create permissions if they don't exist
        String[] permissionNames = {
            "manage-admin",
            "view-accounts",
            "manage-accounts",
            "view-limits",
            "manage-limits",
            "view-audit-logs",
            "view-transactions",
            "manage-transactions",
            "approve-admin-actions",
            "manage-admins",
            "manage-roles",
            "manage-kyc",
            "manage-cards",
            "manage-beneficiaries",
            "manage-adjustments",
            "manage-payments",
            "view-security",
            "manage-security",
            "manage-reports",
            "manage-system"
        };

        for (String permName : permissionNames) {
            permissionRepository.findByPermissionName(permName).orElseGet(() -> {
                Permission perm = new Permission();
                perm.setPermissionName(permName);
                perm.setDescription(permName.replace('-', ' '));
                return permissionRepository.save(perm);
            });
        }

        // Create ADMIN role with all permissions
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role role = new Role();
            role.setRoleName("ADMIN");
            role.setDescription("Administrator role with full access");
            return roleRepository.save(role);
        });

        // Assign all permissions to ADMIN role
        Set<Permission> allPerms = new java.util.HashSet<>();
        for (String permName : permissionNames) {
            permissionRepository.findByPermissionName(permName).ifPresent(allPerms::add);
        }
        adminRole.setPermissions(allPerms);
        roleRepository.save(adminRole);

        // Create USER role with basic permissions
        roleRepository.findByName("USER").orElseGet(() -> {
            Role role = new Role();
            role.setRoleName("USER");
            role.setDescription("Standard user role");
            return roleRepository.save(role);
        });

        // Assign basic permissions to USER role
        Role userRole = roleRepository.findByName("USER").orElseThrow();
        userRole.setPermissions(allPerms.stream()
            .filter(p -> p.getPermissionName().equals("view-accounts") ||
                        p.getPermissionName().equals("view-transactions"))
            .collect(java.util.stream.Collectors.toSet()));
        roleRepository.save(userRole);
    }

    private void createDefaultAdmin() {
        String adminUsername = "system";
        String adminEmail = "system@gmail.com";
        String adminPassword = "PASSWORD";

        if (userRepository.findByUsernameOrEmailOrUid(adminUsername).isPresent()) {
            log.info("Default admin user already exists, skipping creation");
            return;
        }

        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow(
            () -> new IllegalStateException("ADMIN role not found")
        );

        User admin = User.builder()
            .username(adminUsername)
            .email(adminEmail)
            .password(passwordEncoder.encode(adminPassword))
            .uid(com.github.f4b6a3.ulid.UlidCreator.getUlid().toString())
            .roles(Set.of(adminRole))
            .permissions(Set.of())
            .build();

        userRepository.save(admin);
        log.info("Default admin user created: {} ({})", adminUsername, adminEmail);
    }
}