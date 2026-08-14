package com.bank.core.data.user.kyc;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface KycRepository extends JpaRepository<UserKyc, Long>, JpaSpecificationExecutor<UserKyc> {

    Optional<UserKyc> findByUserUserId(Long userId);
}