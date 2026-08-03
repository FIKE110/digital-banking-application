package com.bank.extern.audit.controller;

import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import com.bank.extern.audit.model.AuditEvent;
import com.bank.extern.audit.model.AuditEventRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-events")
@RequiredArgsConstructor
public class AuditEventController {

    private final AuditEventRepository auditEventRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditEvent>>> list(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String actorId,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String targetId,
            @RequestParam(required = false) String correlationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String actorType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Specification<AuditEvent> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (eventType != null && !eventType.isBlank()) {
                predicates.add(cb.like(root.get("eventType"), "%" + eventType + "%"));
            }
            if (actorId != null && !actorId.isBlank()) {
                predicates.add(cb.equal(root.get("actorId"), actorId));
            }
            if (targetType != null && !targetType.isBlank()) {
                predicates.add(cb.equal(root.get("targetType"), targetType));
            }
            if (targetId != null && !targetId.isBlank()) {
                predicates.add(cb.equal(root.get("targetId"), targetId));
            }
            if (correlationId != null && !correlationId.isBlank()) {
                predicates.add(cb.equal(root.get("correlationId"), correlationId));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (riskLevel != null && !riskLevel.isBlank()) {
                predicates.add(cb.equal(root.get("riskLevel"), riskLevel));
            }
            if (actorType != null && !actorType.isBlank()) {
                predicates.add(cb.equal(root.get("actorType"), actorType));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditEvent> result = auditEventRepository.findAll(spec,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "occurredAt")));
        return ApiResponseUtil.buildSuccess(200, "Audit events fetched", result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditEvent>> getById(@PathVariable UUID id) {
        AuditEvent event = auditEventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Audit event not found: " + id));
        return ApiResponseUtil.buildSuccess(200, "Audit event fetched", event);
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @RequestParam(required = false) String actorId,
            @RequestParam(required = false) String riskLevel) {

        Specification<AuditEvent> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (actorId != null && !actorId.isBlank()) {
                predicates.add(cb.equal(root.get("actorId"), actorId));
            }
            if (riskLevel != null && !riskLevel.isBlank()) {
                predicates.add(cb.equal(root.get("riskLevel"), riskLevel));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        long totalEvents = auditEventRepository.count(spec);

        Specification<AuditEvent> criticalSpec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("riskLevel"), "CRITICAL"));
            if (actorId != null && !actorId.isBlank()) {
                predicates.add(cb.equal(root.get("actorId"), actorId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        long criticalEvents = auditEventRepository.count(criticalSpec);

        Specification<AuditEvent> highSpec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("riskLevel"), "HIGH"));
            if (actorId != null && !actorId.isBlank()) {
                predicates.add(cb.equal(root.get("actorId"), actorId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        long highEvents = auditEventRepository.count(highSpec);

        Specification<AuditEvent> recentSpec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.greaterThan(root.get("occurredAt"), LocalDateTime.now().minusHours(24)));
            if (actorId != null && !actorId.isBlank()) {
                predicates.add(cb.equal(root.get("actorId"), actorId));
            }
            if (riskLevel != null && !riskLevel.isBlank()) {
                predicates.add(cb.equal(root.get("riskLevel"), riskLevel));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        long last24h = auditEventRepository.count(recentSpec);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", totalEvents);
        stats.put("criticalEvents", criticalEvents);
        stats.put("highEvents", highEvents);
        stats.put("last24h", last24h);

        return ApiResponseUtil.buildSuccess(200, "Audit stats fetched", stats);
    }

    @GetMapping("/high-risk")
    public ResponseEntity<ApiResponse<Page<AuditEvent>>> getHighRiskEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Specification<AuditEvent> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.or(
                    cb.equal(root.get("riskLevel"), "HIGH"),
                    cb.equal(root.get("riskLevel"), "CRITICAL")
            ));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditEvent> result = auditEventRepository.findAll(spec,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "occurredAt")));
        return ApiResponseUtil.buildSuccess(200, "High-risk audit events fetched", result);
    }
}
