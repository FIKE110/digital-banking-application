package com.bank.core.app.card;

import com.bank.common.dto.card.CardResponse;
import com.bank.common.dto.card.ChangeCardPinRequest;
import com.bank.common.dto.card.CreateCardRequest;
import com.bank.common.dto.card.UpdateCardLimitsRequest;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.card.Card;
import com.bank.core.data.card.CardRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardServiceImpl implements CardService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final BigDecimal DEFAULT_DAILY_LIMIT = new BigDecimal("500000");
    private static final BigDecimal DEFAULT_MONTHLY_LIMIT = new BigDecimal("2000000");

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CardResponse create(CreateCardRequest request) {
        User currentUser = getCurrentUser();

        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Account not found: " + request.getAccountNumber()));

        if (!account.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Account does not belong to the current user");
        }
        if (!"ACTIVE".equals(account.getStatus())) {
            throw new IllegalArgumentException("Account is not active");
        }

        String cardType = (request.getCardType() == null || request.getCardType().isBlank())
                ? "VIRTUAL"
                : request.getCardType().toUpperCase();
        if (!"VIRTUAL".equals(cardType) && !"PHYSICAL".equals(cardType)) {
            throw new IllegalArgumentException("Invalid card type: " + cardType);
        }

        Card card = Card.builder()
                .userId(currentUser.getId())
                .accountNumber(account.getAccountNumber())
                .cardNumber(generateCardNumber())
                .cardType(cardType)
                .expiryDate(YearMonth.now().plusYears(3).atEndOfMonth())
                .cvv(generateCvv())
                .pinHash(passwordEncoder.encode("0000"))
                .status("ACTIVE")
                .dailyLimit(DEFAULT_DAILY_LIMIT)
                .monthlyLimit(DEFAULT_MONTHLY_LIMIT)
                .build();

        Card saved = cardRepository.save(card);
        return mapToResponse(saved);
    }

    @Override
    public List<CardResponse> findAll() {
        User currentUser = getCurrentUser();
        return cardRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CardResponse freeze(UUID id) {
        Card card = getOwnedCard(id);
        card.setStatus("FROZEN");
        return mapToResponse(cardRepository.save(card));
    }

    @Override
    @Transactional
    public CardResponse unfreeze(UUID id) {
        Card card = getOwnedCard(id);
        card.setStatus("ACTIVE");
        return mapToResponse(cardRepository.save(card));
    }

    @Override
    @Transactional
    public CardResponse replace(UUID id) {
        Card card = getOwnedCard(id);
        card.setCardNumber(generateCardNumber());
        card.setCvv(generateCvv());
        card.setExpiryDate(YearMonth.now().plusYears(3).atEndOfMonth());
        card.setStatus("ACTIVE");
        return mapToResponse(cardRepository.save(card));
    }

    @Override
    @Transactional
    public CardResponse changePin(UUID id, ChangeCardPinRequest request) {
        Card card = getOwnedCard(id);

        if (request.getNewPin() == null || !request.getNewPin().matches("\\d{4}")) {
            throw new IllegalArgumentException("New PIN must be exactly 4 digits");
        }
        if (!passwordEncoder.matches(request.getCurrentPin(), card.getPinHash())) {
            throw new IllegalArgumentException("Current PIN is incorrect");
        }

        card.setPinHash(passwordEncoder.encode(request.getNewPin()));
        return mapToResponse(cardRepository.save(card));
    }

    @Override
    @Transactional
    public CardResponse updateLimits(UUID id, UpdateCardLimitsRequest request) {
        Card card = getOwnedCard(id);

        if (request.getDailyLimit().compareTo(BigDecimal.ZERO) <= 0
                || request.getMonthlyLimit().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Limits must be greater than zero");
        }
        if (request.getDailyLimit().compareTo(request.getMonthlyLimit()) > 0) {
            throw new IllegalArgumentException("Daily limit cannot exceed monthly limit");
        }

        card.setDailyLimit(request.getDailyLimit());
        card.setMonthlyLimit(request.getMonthlyLimit());
        return mapToResponse(cardRepository.save(card));
    }

    private Card getOwnedCard(UUID id) {
        User currentUser = getCurrentUser();
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Card not found: " + id));
        if (!card.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized access to card");
        }
        return card;
    }

    private String generateCardNumber() {
        String number;
        do {
            StringBuilder sb = new StringBuilder("4");
            for (int i = 0; i < 15; i++) {
                sb.append(RANDOM.nextInt(10));
            }
            number = sb.toString();
        } while (cardRepository.existsByCardNumber(number));
        return number;
    }

    private String generateCvv() {
        return String.format("%03d", RANDOM.nextInt(1000));
    }

    private CardResponse mapToResponse(Card card) {
        return CardResponse.builder()
                .id(card.getId())
                .userId(card.getUserId())
                .accountNumber(card.getAccountNumber())
                .cardNumber(card.getCardNumber())
                .cardType(card.getCardType())
                .expiryDate(card.getExpiryDate())
                .cvv(card.getCvv())
                .status(card.getStatus())
                .dailyLimit(card.getDailyLimit())
                .monthlyLimit(card.getMonthlyLimit())
                .createdAt(card.getCreatedAt())
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
