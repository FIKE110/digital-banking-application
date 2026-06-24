package com.bank.core.background;

import com.bank.core.data.role.Role;
import com.bank.core.data.role.RoleRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class BackgroundStartup implements ApplicationListener<ApplicationReadyEvent> {

    private final RoleRepository roleRepository;

    public BackgroundStartup(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public void onApplicationEvent(ApplicationReadyEvent event) {
        Role role = Role.builder().roleName("ROLE_ADMIN").permissions(Collections.emptySet()).build();
        Role role1 = Role.builder().roleName("ROLE_USER").permissions(Collections.emptySet()).build();
        List<Role> roles = List.of(role, role1);

        roles.forEach(r -> {
            Optional<Role> optionalRole = roleRepository.findByName(r.getRoleName());

            if (optionalRole.isPresent()) {
                Role foundRole = optionalRole.get();
                foundRole.setPermissions(r.getPermissions());
                foundRole.setDescription(r.getDescription());
            } else {
                roleRepository.save(r);
            }
        });
    }
}
