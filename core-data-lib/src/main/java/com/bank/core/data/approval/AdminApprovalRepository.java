package com.bank.core.data.approval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminApprovalRepository extends JpaRepository<AdminApproval, Long>, JpaSpecificationExecutor<AdminApproval> {

    List<AdminApproval> findByStatusAndExpiresAtBefore(String status, LocalDateTime now);

    long countByStatus(String status);
}
