package com.bank.core.data.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("""
                SELECT u FROM User u where u.username=:username or u.email=:username or u.uid=:username
                """)
    Optional<User> findByUsernameOrEmailOrUid(@Param("username") String username);
}
