package com.bank.core.data.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountTypeLimitRepository extends JpaRepository<AccountTypeLimit, UUID> {

    Optional<AccountTypeLimit> findByAccountType(String accountType);
}
