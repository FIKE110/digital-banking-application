package com.bank.core.data.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByAccountNumberOrderByCreatedAtDesc(String accountNumber);

    List<Transaction> findByAccountNumberInOrderByCreatedAtDesc(List<String> accountNumbers);

    Optional<Transaction> findByReferenceAndAccountNumber(String reference, String accountNumber);
}