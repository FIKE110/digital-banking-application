package com.bank.core.data.user.kyc;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface KycRepository extends JpaRepository<UserKyc, Long>, JpaSpecificationExecutor<UserKyc> {
}