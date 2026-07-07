package com.bank.core.app.account.accountRepository;

import com.bank.core.app.account.AccountInfo.AccountInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository <AccountInfo, UUID>{
    @Override
    Optional<AccountInfo> findById(UUID uuid);
}
