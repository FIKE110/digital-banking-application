package com.bank.core.background;

import com.bank.core.data.role.Permission;
import com.bank.core.data.role.PermissionRepository;
import com.bank.core.data.role.Role;
import com.bank.core.data.role.RoleRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class BackgroundStartup implements ApplicationListener<ApplicationReadyEvent> {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    private static final List<String> ALL_PERMISSION_NAMES = List.of(
            "create-bank-account",
            "view-bank-accounts",
            "view-bank-account",
            "view-bank-account-balance",
            "update-bank-account-status",
            "execute-transfer",
            "view-transfers",
            "view-transfer",
            "reverse-transfer",
            "view-profile",
            "update-profile",
            "view-ledger-transactions",
            "view-ledger-transaction",
            "view-ledger-entries",
            "manage-admin"
    );

    private static final List<String> USER_PERMISSION_NAMES = List.of(
            "create-bank-account",
            "view-bank-accounts",
            "view-bank-account",
            "view-bank-account-balance",
            "execute-transfer",
            "view-transfers",
            "view-transfer",
            "view-profile",
            "update-profile",
            "view-ledger-transactions",
            "view-ledger-transaction",
            "view-ledger-entries"
    );

    public BackgroundStartup(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    @Transactional
    public void onApplicationEvent(ApplicationReadyEvent event) {
        seedPermissions();
        seedRoles();
    }

    private void seedPermissions() {
        for (String name : ALL_PERMISSION_NAMES) {
            if (permissionRepository.findByPermissionName(name).isEmpty()) {
                Permission p = new Permission();
                p.setPermissionName(name);
                permissionRepository.save(p);
            }
        }
    }

    private void seedRoles() {
        List<Permission> allPermissions = permissionRepository.findAll();

        Set<Permission> userPermissions = new HashSet<>();
        Set<Permission> adminPermissions = new HashSet<>(allPermissions);

        for (Permission p : allPermissions) {
            if (USER_PERMISSION_NAMES.contains(p.getPermissionName())) {
                userPermissions.add(p);
            }
        }

        List<Role> roles = List.of(
                Role.builder().roleName("ROLE_USER").permissions(userPermissions).build(),
                Role.builder().roleName("ROLE_ADMIN").permissions(adminPermissions).build()
        );

        roles.forEach(r -> {
            Optional<Role> found = roleRepository.findByName(r.getRoleName());
            if (found.isPresent()) {
                Role existing = found.get();
                existing.setPermissions(r.getPermissions());
                existing.setDescription(r.getDescription());
            } else {
                roleRepository.save(r);
            }
        });
    }
}
