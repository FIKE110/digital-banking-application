package com.bank.core.app.beneficiary;

import com.bank.common.dto.beneficiary.BeneficiaryRequest;
import com.bank.common.dto.beneficiary.BeneficiaryResponse;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.beneficiary.Beneficiary;
import com.bank.core.data.beneficiary.BeneficiaryRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final com.bank.core.app.kyc.KycGate kycGate;

    @Override
    public List<BeneficiaryResponse> findAll() {
        User currentUser = getCurrentUser();
        return beneficiaryRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BeneficiaryResponse create(BeneficiaryRequest request) {
        User currentUser = getCurrentUser();
        kycGate.requireApproved(currentUser.getId(), "saving beneficiaries");

        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Beneficiary account not found: " + request.getAccountNumber()));

        if (!"ACTIVE".equals(account.getStatus())) {
            throw new IllegalArgumentException("Beneficiary account is not active");
        }

        Beneficiary beneficiary = Beneficiary.builder()
                .alias(request.getAlias())
                .accountNumber(request.getAccountNumber())
                .bankName(request.getBankName())
                .description(request.getDescription())
                .userId(currentUser.getId())
                .build();

        Beneficiary saved = beneficiaryRepository.save(beneficiary);
        return mapToResponse(saved);
    }

    @Override
    public void delete(UUID id) {
        User currentUser = getCurrentUser();
        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Beneficiary not found: " + id));

        if (!beneficiary.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized access to beneficiary");
        }

        beneficiaryRepository.delete(beneficiary);
    }

    private BeneficiaryResponse mapToResponse(Beneficiary beneficiary) {
        return BeneficiaryResponse.builder()
                .id(beneficiary.getId())
                .alias(beneficiary.getAlias())
                .accountNumber(beneficiary.getAccountNumber())
                .bankName(beneficiary.getBankName())
                .description(beneficiary.getDescription())
                .createdAt(beneficiary.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }

        String username = authentication.getName();
        return userRepository.findByUsernameOrEmailOrUid(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));
    }
}
