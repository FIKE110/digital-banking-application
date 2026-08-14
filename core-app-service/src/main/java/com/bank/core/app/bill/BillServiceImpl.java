package com.bank.core.app.bill;

import com.bank.common.dto.bill.BillerCatalogResponse;
import com.bank.common.dto.bill.BillPaymentRequest;
import com.bank.common.dto.bill.BillPaymentResponse;
import com.bank.common.util.IdGenerator;
import com.bank.core.app.notification.NotificationService;
import com.bank.core.app.outbox.OutboxService;
import com.bank.core.app.pin.PinService;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.bill.BillPayment;
import com.bank.core.data.bill.BillPaymentRepository;
import com.bank.core.data.transaction.Transaction;
import com.bank.core.data.transaction.TransactionRepository;
import com.bank.core.data.user.User;
import com.bank.core.data.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private final BillPaymentRepository billPaymentRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final OutboxService outboxService;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    private final PinService pinService;

    @Override
    @Transactional
    public BillPaymentResponse pay(BillPaymentRequest request) {
        User currentUser = getCurrentUser();

        // Verify transaction PIN
        if (request.getPin() == null || request.getPin().isBlank()) {
            throw new IllegalArgumentException("Transaction PIN is required for bill payments");
        }
        pinService.verifyPin(new com.bank.common.dto.pin.VerifyPinRequest(request.getPin()));

        Account account = accountRepository.findByAccountNumber(request.getSourceAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Source account not found: " + request.getSourceAccountNumber()));

        if (!account.getUserId().equals(currentUser.getId())) {
            throw new SecurityException("Source account does not belong to the current user");
        }
        if (!"ACTIVE".equals(account.getStatus())) {
            throw new IllegalArgumentException("Source account is not active");
        }

        BigDecimal amount = request.getAmount();
        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        String reference = IdGenerator.generateUlid();
        String description = (request.getDescription() == null || request.getDescription().isBlank())
                ? "Bill payment - " + request.getProvider()
                : request.getDescription().trim();

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        BillPayment payment = BillPayment.builder()
                .reference(reference)
                .sourceAccountNumber(request.getSourceAccountNumber())
                .provider(request.getProvider())
                .customerReference(request.getCustomerReference())
                .amount(amount)
                .description(description)
                .status("COMPLETED")
                .build();
        BillPayment saved = billPaymentRepository.save(payment);

        Transaction debitEntry = Transaction.builder()
                .reference(reference)
                .accountNumber(account.getAccountNumber())
                .amount(amount)
                .type("DEBIT")
                .description(description)
                .status("COMPLETED")
                .build();
        transactionRepository.save(debitEntry);

        emitBillPaymentEvent(account, currentUser, amount, reference, request.getProvider());

        notificationService.notify(currentUser.getId(), "DEBIT", "Bill payment",
                amount + " " + account.getCurrency() + " paid to " + request.getProvider()
                        + (request.getCustomerReference() != null
                        && !request.getCustomerReference().isBlank()
                        ? " · ref " + request.getCustomerReference() : ""));

        return mapToResponse(saved);
    }

    @Override
    public List<BillerCatalogResponse> getCatalog() {
        return List.of(
                BillerCatalogResponse.builder().name("Electricity").category("Utilities").build(),
                BillerCatalogResponse.builder().name("Internet").category("Utilities").build(),
                BillerCatalogResponse.builder().name("Water").category("Utilities").build(),
                BillerCatalogResponse.builder().name("Cable TV").category("Entertainment").build(),
                BillerCatalogResponse.builder().name("Mobile Top-up").category("Mobile").build(),
                BillerCatalogResponse.builder().name("Data & Airtime").category("Mobile").build(),
                BillerCatalogResponse.builder().name("Insurance").category("Financial").build(),
                BillerCatalogResponse.builder().name("Education").category("Education").build(),
                BillerCatalogResponse.builder().name("Rent").category("Housing").build(),
                BillerCatalogResponse.builder().name("Transport").category("Travel").build()
        );
    }

    @Override
    public List<BillPaymentResponse> findAll() {
        User currentUser = getCurrentUser();
        List<Account> userAccounts = accountRepository.findByUserId(currentUser.getId());
        List<String> accountNumbers = userAccounts.stream()
                .map(Account::getAccountNumber)
                .collect(Collectors.toList());

        if (accountNumbers.isEmpty()) {
            return List.of();
        }

        return billPaymentRepository.findByAccountNumbers(accountNumbers)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void emitBillPaymentEvent(Account account, User user, BigDecimal amount,
                                      String reference, String provider) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", user.getEmail());
            payload.put("name", user.getUsername());
            payload.put("amount", amount.toPlainString());
            payload.put("type", "debit");
            payload.put("provider", provider);
            payload.put("balance", account.getBalance().toPlainString());

            outboxService.saveEvent("BILL", reference, "BILL_PAYMENT_COMPLETED",
                    objectMapper.writeValueAsString(payload),
                    LocalDateTime.now().plusMinutes(30));
        } catch (Exception e) {
            log.error("Failed to emit bill payment outbox event: {}", e.getMessage());
        }
    }

    private BillPaymentResponse mapToResponse(BillPayment payment) {
        return BillPaymentResponse.builder()
                .id(payment.getId())
                .reference(payment.getReference())
                .sourceAccountNumber(payment.getSourceAccountNumber())
                .provider(payment.getProvider())
                .customerReference(payment.getCustomerReference())
                .amount(payment.getAmount())
                .description(payment.getDescription())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
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
