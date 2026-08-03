package com.bank.core.data.outbox;

import com.bank.common.enums.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    @Query("""
            SELECT e FROM OutboxEvent e
            WHERE e.status = :status
              AND (e.validUntil IS NULL OR e.validUntil > :now)
            ORDER BY e.createdAt ASC
            """)
    List<OutboxEvent> findDue(OutboxStatus status, LocalDateTime now);
}