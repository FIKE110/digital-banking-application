package com.bank.core.data.card;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID>, JpaSpecificationExecutor<Card> {

    List<Card> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByCardNumber(String cardNumber);
}
