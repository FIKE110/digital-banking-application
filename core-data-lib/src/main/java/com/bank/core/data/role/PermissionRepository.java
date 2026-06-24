package com.bank.core.data.role;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission,Long> {

    Optional<Permission> findByPermissionName(String permissionName);
}
