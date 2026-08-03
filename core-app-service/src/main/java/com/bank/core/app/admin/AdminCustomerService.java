package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminAccountResponse;
import com.bank.common.dto.admin.AdminCustomerDetailResponse;
import com.bank.common.dto.admin.AdminCustomerResponse;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.beneficiary.BeneficiaryRepository;
import com.bank.core.data.card.CardRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import com.bank.core.data.user.kyc.KycRepository;
import com.bank.core.data.user.kyc.UserKyc;
import com.bank.core.data.user.profile.UserProfile;
import com.bank.core.data.user.profile.UserProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final KycRepository kycRepository;
    private final AdminAuditService adminAuditService;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public Page<AdminCustomerResponse> listCustomers(String search, String fromDate, String toDate,
                                                     Pageable pageable) {
        List<Long> adminIds = userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream()
                        .anyMatch(r -> "ADMIN".equals(r.getRoleName())))
                .map(User::getId)
                .collect(Collectors.toList());

        Specification<User> spec = Specification.where((root, query, cb) -> cb.conjunction());
        if (!adminIds.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.not(root.get("id").in(adminIds)));
        }

        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("username")), "%" + q + "%"),
                    cb.like(cb.lower(root.get("email")), "%" + q + "%"),
                    cb.like(cb.lower(root.get("uid")), "%" + q + "%")
            ));
        }
        if (fromDate != null && !fromDate.isBlank()) {
            LocalDateTime from = LocalDateTime.parse(fromDate + "T00:00:00");
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (toDate != null && !toDate.isBlank()) {
            LocalDateTime to = LocalDateTime.parse(toDate + "T23:59:59");
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
        }

        return userRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminCustomerDetailResponse getCustomer(Long id, HttpServletRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));

        List<Account> accounts = accountRepository.findByUserId(id);
        UserProfile profile = userProfileRepository.findByUserId(id).orElse(null);
        UserKyc kyc = null;
        try {
            kyc = kycRepository.findAll().stream()
                    .filter(k -> k.getUser() != null && k.getUser().getUserId() != null && k.getUser().getUserId().equals(id))
                    .findFirst().orElse(null);
        } catch (Exception ignored) {}

        adminAuditService.audit(AdminAuditEventType.CUSTOMER_VIEWED, "CUSTOMER", String.valueOf(id),
                user.getUsername(), "Viewed customer profile", request);

        return AdminCustomerDetailResponse.builder()
                .customer(mapToResponse(user))
                .phoneNumber(profile != null ? profile.getPhoneNumber() : null)
                .gender(profile != null && profile.getGender() != null ? profile.getGender().name() : null)
                .dateOfBirth(profile != null && profile.getDateOfBirth() != null ? profile.getDateOfBirth().toString() : null)
                .kycStatus(kyc != null ? kyc.getBvnVerificationStatus().name() : "UNVERIFIED")
                .accounts(accounts.stream()
                        .map(a -> mapAccountResponse(a, user))
                        .collect(Collectors.toList()))
                .cardCount(cardRepository.findByUserIdOrderByCreatedAtDesc(id).size())
                .beneficiaryCount(beneficiaryRepository.findByUserIdOrderByCreatedAtDesc(id).size())
                .build();
    }

    private AdminCustomerResponse mapToResponse(User user) {
        return AdminCustomerResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .uid(user.getUid())
                .status(user.isDeleted() ? "DELETED" : "ACTIVE")
                .accountCount(accountRepository.findByUserId(user.getId()).size())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AdminAccountResponse mapAccountResponse(Account account, User user) {
        return AdminAccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .status(account.getStatus())
                .userId(account.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}