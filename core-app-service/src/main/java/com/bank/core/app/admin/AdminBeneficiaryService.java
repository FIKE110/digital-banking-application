package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminBeneficiaryResponse;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.beneficiary.Beneficiary;
import com.bank.core.data.beneficiary.BeneficiaryRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminBeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public Page<AdminBeneficiaryResponse> listBeneficiaries(String search, Long userId,
                                                            Pageable pageable) {
        Specification<Beneficiary> spec = Specification.where((root, query, cb) -> cb.conjunction());
        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), userId));
        }
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("alias")), "%" + q + "%"),
                    cb.like(root.get("accountNumber"), "%" + q + "%")
            ));
        }
        return beneficiaryRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional
    public void deleteBeneficiary(UUID id, HttpServletRequest request) {
        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Beneficiary not found: " + id));
        beneficiaryRepository.delete(beneficiary);
        adminAuditService.audit(AdminAuditEventType.BENEFICIARY_DELETED, "BENEFICIARY", id.toString(),
                beneficiary.getAlias(), "Beneficiary removed by admin", request);
    }

    private AdminBeneficiaryResponse mapToResponse(Beneficiary b) {
        User user = userRepository.findById(b.getUserId()).orElse(null);
        return AdminBeneficiaryResponse.builder()
                .id(b.getId())
                .alias(b.getAlias())
                .accountNumber(b.getAccountNumber())
                .bankName(b.getBankName())
                .description(b.getDescription())
                .userId(b.getUserId())
                .username(user != null ? user.getUsername() : null)
                .createdAt(b.getCreatedAt())
                .build();
    }
}