package com.bank.core.data.role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role,Long> {

    @Query("""
            SELECT r FROM Role r where r.roleName=:name
            """)
    public Optional<Role> findByName(@Param("name") String name);
}
