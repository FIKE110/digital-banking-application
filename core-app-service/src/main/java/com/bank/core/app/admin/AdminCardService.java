package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminCardResponse;
import com.bank.common.enums.AdminAuditEventType;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.card.Card;
import com.bank.core.data.card.CardRepository;
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
public class AdminCardService {

    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public Page<AdminCardResponse> listCards(String status, String cardType, String search,
                                             Pageable pageable) {
        Specification<Card> spec = Specification.where((root, query, cb) -> cb.conjunction());
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status.toUpperCase()));
        }
        if (cardType != null && !cardType.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("cardType"), cardType.toUpperCase()));
        }
        if (search != null && !search.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(root.get("accountNumber"), "%" + search + "%"));
        }

        User admin = securityUtil.currentUser();
        return cardRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminCardResponse getCard(UUID id) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Card not found: " + id));
        return mapToResponse(card);
    }

    @Transactional
    public AdminCardResponse freezeCard(UUID id, HttpServletRequest request) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Card not found: " + id));
        String previous = card.getStatus();
        card.setStatus("FROZEN");
        Card saved = cardRepository.save(card);
        adminAuditService.audit(AdminAuditEventType.CARD_FROZEN, "CARD", id.toString(),
                "Card ending " + card.getCardNumber().substring(card.getCardNumber().length() - 4),
                "Card frozen (was " + previous + ")", previous, "FROZEN", request);
        return mapToResponse(saved);
    }

    @Transactional
    public AdminCardResponse unfreezeCard(UUID id, HttpServletRequest request) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Card not found: " + id));
        String previous = card.getStatus();
        card.setStatus("ACTIVE");
        Card saved = cardRepository.save(card);
        adminAuditService.audit(AdminAuditEventType.CARD_UNFROZEN, "CARD", String.valueOf(id),
                "Card ending " + card.getCardNumber().substring(card.getCardNumber().length() - 4),
                "Card unfrozen (was " + previous + ")", previous, "ACTIVE", request);
        return mapToResponse(saved);
    }

    private AdminCardResponse mapToResponse(Card card) {
        User user = userRepository.findById(card.getUserId()).orElse(null);
        return AdminCardResponse.builder()
                .id(card.getId())
                .cardNumberLast4(card.getCardNumber().substring(Math.max(0, card.getCardNumber().length() - 4)))
                .cardType(card.getCardType())
                .expiryDate(card.getExpiryDate())
                .status(card.getStatus())
                .dailyLimit(card.getDailyLimit())
                .monthlyLimit(card.getMonthlyLimit())
                .userId(card.getUserId())
                .username(user != null ? user.getUsername() : null)
                .accountNumber(card.getAccountNumber())
                .createdAt(card.getCreatedAt())
                .build();
    }
}