package com.bank.core.data.bill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface BillPaymentRepository extends JpaRepository<BillPayment, UUID>, JpaSpecificationExecutor<BillPayment> {

    @Query("SELECT b FROM BillPayment b WHERE b.sourceAccountNumber IN :accountNumbers ORDER BY b.createdAt DESC")
    List<BillPayment> findByAccountNumbers(@Param("accountNumbers") List<String> accountNumbers);
}
