package com.bank.extern.email.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmailDeliveryRepository extends JpaRepository<EmailDelivery, UUID> {

    List<EmailDelivery> findByStatusOrderByCreatedAtAsc(String status);

    List<EmailDelivery> findAllByOrderByCreatedAtDesc();
}