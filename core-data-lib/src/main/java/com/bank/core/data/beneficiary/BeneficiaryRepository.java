package com.bank.core.data.beneficiary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, UUID>, JpaSpecificationExecutor<Beneficiary> {

    List<Beneficiary> findByUserIdOrderByCreatedAtDesc(Long userId);
}
