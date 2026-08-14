package com.bank.core.app.receipt;

import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.bill.BillPayment;
import com.bank.core.data.bill.BillPaymentRepository;
import com.bank.core.data.transaction.Transaction;
import com.bank.core.data.transaction.TransactionRepository;
import com.bank.core.data.transfer.Transfer;
import com.bank.core.data.transfer.TransferRepository;
import com.bank.core.data.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + "/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;
    private final TransferRepository transferRepository;
    private final BillPaymentRepository billPaymentRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final SecurityUtil securityUtil;

    @GetMapping(value = "/transfers/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> transferReceipt(@PathVariable UUID id) {
        Transfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found: " + id));
        ensureInvolved(transfer.getSourceAccountNumber(), transfer.getDestinationAccountNumber());
        byte[] pdf = receiptService.transferReceipt(transfer);
        return pdfResponse(pdf, "receipt-transfer-" + safeFilename(transfer.getReference()) + ".pdf");
    }

    @GetMapping(value = "/transfers/by-reference/{reference}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> transferReceiptByReference(@PathVariable String reference) {
        Transfer transfer = transferRepository.findByReference(reference)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found: " + reference));
        ensureInvolved(transfer.getSourceAccountNumber(), transfer.getDestinationAccountNumber());
        byte[] pdf = receiptService.transferReceipt(transfer);
        return pdfResponse(pdf, "receipt-transfer-" + safeFilename(transfer.getReference()) + ".pdf");
    }

    @GetMapping(value = "/bills/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> billReceipt(@PathVariable UUID id) {
        BillPayment payment = billPaymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bill payment not found: " + id));
        ensureInvolved(payment.getSourceAccountNumber(), null);
        byte[] pdf = receiptService.billReceipt(payment);
        return pdfResponse(pdf, "receipt-bill-" + safeFilename(payment.getReference()) + ".pdf");
    }

    @GetMapping(value = "/bills/by-reference/{reference}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> billReceiptByReference(@PathVariable String reference) {
        BillPayment payment = billPaymentRepository.findByReference(reference)
                .orElseThrow(() -> new IllegalArgumentException("Bill payment not found: " + reference));
        ensureInvolved(payment.getSourceAccountNumber(), null);
        byte[] pdf = receiptService.billReceipt(payment);
        return pdfResponse(pdf, "receipt-bill-" + safeFilename(payment.getReference()) + ".pdf");
    }

    @GetMapping(value = "/deposits/by-reference/{reference}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> depositReceiptByReference(@PathVariable String reference,
                                                            @RequestParam String accountNumber) {
        Transaction transaction = transactionRepository.findByReferenceAndAccountNumber(reference, accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Deposit not found: " + reference));
        ensureInvolved(transaction.getAccountNumber(), null);
        if (!"CREDIT".equalsIgnoreCase(transaction.getType())) {
            throw new IllegalArgumentException("Transaction is not a deposit: " + reference);
        }
        byte[] pdf = receiptService.depositReceipt(transaction);
        return pdfResponse(pdf, "receipt-deposit-" + safeFilename(transaction.getReference()) + ".pdf");
    }

    @GetMapping(value = "/statements/{accountNumber}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> statement(@PathVariable String accountNumber,
                                            @RequestParam(required = false) String month) {
        YearMonth yearMonth = month == null || month.isBlank()
                ? YearMonth.now()
                : YearMonth.parse(month);
        ensureInvolved(accountNumber, null);
        byte[] pdf = receiptService.statement(accountNumber, yearMonth);
        return pdfResponse(pdf, "statement-" + safeFilename(accountNumber)
                + "-" + yearMonth + ".pdf");
    }

    private void ensureInvolved(String sourceAccountNumber, String destinationAccountNumber) {
        User user = securityUtil.currentUser();
        List<Account> accounts = accountRepository.findByUserId(user.getId());
        boolean involved = accounts.stream().anyMatch(a ->
                a.getAccountNumber().equals(sourceAccountNumber)
                        || (destinationAccountNumber != null && a.getAccountNumber().equals(destinationAccountNumber)));
        if (!involved) {
            throw new SecurityException("Unauthorized access to receipt");
        }
    }

    private ResponseEntity<byte[]> pdfResponse(byte[] pdf, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    private String safeFilename(String reference) {
        return reference == null ? "receipt" : reference.replaceAll("[^a-zA-Z0-9_-]", "");
    }
}