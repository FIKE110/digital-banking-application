package com.bank.core.data.outbox;

import com.bank.common.enums.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    List<OutboxEvent> findTop100ByStatusAndValidUntilAfterOrderByCreatedAtAsc(
            OutboxStatus status, LocalDateTime now);
}
