package com.bank.core.data.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    @Query("""
                SELECT u FROM User u where u.username=:username or u.email=:username or u.uid=:username
                """)
    Optional<User> findByUsernameOrEmailOrUid(@Param("username") String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
