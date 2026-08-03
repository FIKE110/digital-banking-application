package com.bank.core.app.admin;

import com.bank.common.dto.bill.BillPaymentResponse;
import com.bank.common.dto.bill.BillerCatalogResponse;
import com.bank.core.app.bill.BillService;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.bill.BillPayment;
import com.bank.core.data.bill.BillPaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminBillPaymentService {

    private final BillPaymentRepository billPaymentRepository;
    private final BillService billService;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public Page<BillPaymentResponse> listPayments(String provider, String status,
                                                  String fromDate, String toDate,
                                                  BigDecimal minAmount, BigDecimal maxAmount,
                                                  Pageable pageable) {
        Specification<BillPayment> spec = Specification.where((root, query, cb) -> cb.conjunction());
        if (provider != null && !provider.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("provider"), provider));
        }
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status.toUpperCase()));
        }
        if (fromDate != null && !fromDate.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"),
                    LocalDateTime.parse(fromDate + "T00:00:00")));
        }
        if (toDate != null && !toDate.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"),
                    LocalDateTime.parse(toDate + "T23:59:59")));
        }
        if (minAmount != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
        }
        if (maxAmount != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
        }
        return billPaymentRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<BillerCatalogResponse> listProviders() {
        return billService.getCatalog();
    }

    private BillPaymentResponse mapToResponse(BillPayment p) {
        return BillPaymentResponse.builder()
                .id(p.getId())
                .reference(p.getReference())
                .sourceAccountNumber(p.getSourceAccountNumber())
                .provider(p.getProvider())
                .customerReference(p.getCustomerReference())
                .amount(p.getAmount())
                .description(p.getDescription())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}