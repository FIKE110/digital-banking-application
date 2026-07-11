package com.bank.core.data.transfer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransferRepository extends JpaRepository<Transfer, UUID> {

    @Query("SELECT t FROM Transfer t WHERE t.sourceAccountNumber IN :accountNumbers " +
           "OR t.destinationAccountNumber IN :accountNumbers ORDER BY t.createdAt DESC")
    List<Transfer> findByAccountNumbers(@Param("accountNumbers") List<String> accountNumbers);

    Optional<Transfer> findByReference(String reference);
}