package com.bank.core.data.approval;

import com.bank.common.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminApprovalRepository extends JpaRepository<AdminApproval, Long>, JpaSpecificationExecutor<AdminApproval> {

    List<AdminApproval> findByStatusAndExpiresAtBefore(ApprovalStatus status, LocalDateTime now);

    long countByStatus(ApprovalStatus status);
}
