package com.bank.core.app.receipt;

import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.account.Account;
import com.bank.core.data.account.AccountRepository;
import com.bank.core.data.bill.BillPayment;
import com.bank.core.data.transaction.Transaction;
import com.bank.core.data.transaction.TransactionRepository;
import com.bank.core.data.transfer.Transfer;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds download receipts as PDFs from an XHTML template (OpenPDF).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiptService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy 'at' HH:mm");

    private static final String TEMPLATE_PATH = "templates/receipt/receipt.xhtml";
    private static final String STATEMENT_TEMPLATE_PATH = "templates/receipt/statement.xhtml";

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final SecurityUtil securityUtil;

    @Value("${app.bank.name:5ive}")
    private String bankName;
    @Value("${app.bank.tagline:Secure Digital Banking}")
    private String bankTagline;
    @Value("${app.bank.support-email:support@5ive.bank}")
    private String supportEmail;
    @Value("${app.bank.website:5ive.bank}")
    private String website;

    public byte[] transferReceipt(Transfer transfer) {
        Map<String, String> values = new HashMap<>();
        values.put("bankName", bankName);
        values.put("bankTagline", bankTagline);
        values.put("bankSupportEmail", supportEmail);
        values.put("bankWebsite", website);
        values.put("receiptTitle", "Transfer Receipt");
        values.put("reference", transfer.getReference());
        values.put("date", transfer.getCreatedAt() != null ? transfer.getCreatedAt().format(DATE_FORMAT) : "—");
        values.put("status", transfer.getStatus());
        values.put("statusClass", isPending(transfer.getStatus()) ? "pending" : "");
        values.put("currency", accountCurrency(transfer.getSourceAccountNumber()));

        StringBuilder rows = new StringBuilder();
        rows.append(accountRow("From account", transfer.getSourceAccountNumber()));
        rows.append(accountRow("To account", transfer.getDestinationAccountNumber()));
        if (transfer.getDescription() != null && !transfer.getDescription().isBlank()) {
            rows.append(row("Description", escapeHtml(transfer.getDescription())));
        }
        values.put("extraRows", rows.toString());
        values.put("amount", money(transfer.getAmount()));

        return render(values);
    }

    public byte[] billReceipt(BillPayment payment) {
        Map<String, String> values = new HashMap<>();
        values.put("bankName", bankName);
        values.put("bankTagline", bankTagline);
        values.put("bankSupportEmail", supportEmail);
        values.put("bankWebsite", website);
        values.put("receiptTitle", "Bill Payment Receipt");
        values.put("reference", payment.getReference());
        values.put("date", payment.getCreatedAt() != null ? payment.getCreatedAt().format(DATE_FORMAT) : "—");
        values.put("status", payment.getStatus());
        values.put("statusClass", isPending(payment.getStatus()) ? "pending" : "");
        values.put("currency", accountCurrency(payment.getSourceAccountNumber()));

        StringBuilder rows = new StringBuilder();
        rows.append(row("Paid from", payment.getSourceAccountNumber()));
        rows.append(row("Provider", escapeHtml(payment.getProvider())));
        rows.append(row("Customer reference", escapeHtml(payment.getCustomerReference())));
        if (payment.getDescription() != null && !payment.getDescription().isBlank()) {
            rows.append(row("Description", escapeHtml(payment.getDescription())));
        }
        values.put("extraRows", rows.toString());
        values.put("amount", money(payment.getAmount()));

        return render(values);
    }

    public byte[] depositReceipt(Transaction transaction) {
        Map<String, String> values = new HashMap<>();
        values.put("bankName", bankName);
        values.put("bankTagline", bankTagline);
        values.put("bankSupportEmail", supportEmail);
        values.put("bankWebsite", website);
        values.put("receiptTitle", "Deposit Receipt");
        values.put("reference", transaction.getReference());
        values.put("date", transaction.getCreatedAt() != null ? transaction.getCreatedAt().format(DATE_FORMAT) : "—");
        values.put("status", transaction.getStatus());
        values.put("statusClass", isPending(transaction.getStatus()) ? "pending" : "");
        values.put("currency", accountCurrency(transaction.getAccountNumber()));

        StringBuilder rows = new StringBuilder();
        rows.append(accountRow("Account", transaction.getAccountNumber()));
        if (transaction.getDescription() != null && !transaction.getDescription().isBlank()) {
            rows.append(row("Description", escapeHtml(transaction.getDescription())));
        }
        values.put("extraRows", rows.toString());
        values.put("amount", money(transaction.getAmount()));

        return render(values);
    }

    public byte[] statement(String accountNumber, YearMonth month) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountNumber));

        LocalDate fromDate = month.atDay(1);
        LocalDate toDate = month.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findAll(
                TransactionRepository.filters(null, fromDate.atStartOfDay(), toDate.atTime(23, 59, 59), null)).stream()
                .filter(t -> accountNumber.equals(t.getAccountNumber()))
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return a.getCreatedAt().compareTo(b.getCreatedAt());
                })
                .toList();

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        StringBuilder rows = new StringBuilder();
        for (Transaction t : transactions) {
            boolean debit = "DEBIT".equalsIgnoreCase(t.getType());
            rows.append("<tr>")
                    .append("<td>").append(t.getCreatedAt() != null ? t.getCreatedAt().format(DATE_FORMAT) : "—").append("</td>")
                    .append("<td>").append(escapeHtml(t.getReference())).append("</td>")
                    .append("<td>").append(escapeHtml(t.getDescription() != null ? t.getDescription() : "")).append("</td>")
                    .append("<td class=\"num debit\">").append(debit ? money(t.getAmount()) : "").append("</td>")
                    .append("<td class=\"num credit\">").append(debit ? "" : money(t.getAmount())).append("</td>")
                    .append("</tr>");
            if (debit) {
                totalDebit = totalDebit.add(t.getAmount() == null ? BigDecimal.ZERO : t.getAmount());
            } else {
                totalCredit = totalCredit.add(t.getAmount() == null ? BigDecimal.ZERO : t.getAmount());
            }
        }

        rows.append("<tr class=\"total num\">")
                .append("<td></td><td></td><td>TOTAL</td>")
                .append("<td class=\"debit\">").append(money(totalDebit)).append("</td>")
                .append("<td class=\"credit\">").append(money(totalCredit)).append("</td>")
                .append("</tr>");

        Map<String, String> values = new HashMap<>();
        values.put("bankName", bankName);
        values.put("bankTagline", bankTagline);
        values.put("bankSupportEmail", supportEmail);
        values.put("bankWebsite", website);
        values.put("accountNumber", account.getAccountNumber());
        values.put("accountName", escapeHtml(account.getAccountName()));
        values.put("currency", account.getCurrency() == null ? "NGN" : account.getCurrency());
        values.put("period", month.format(DateTimeFormatter.ofPattern("MMMM yyyy")));
        values.put("rows", rows.toString());

        return render(STATEMENT_TEMPLATE_PATH, values);
    }

    private byte[] render(Map<String, String> values) {
        return render(TEMPLATE_PATH, values);
    }

    private byte[] render(String templatePath, Map<String, String> values) {
        try {
            String template = loadTemplate(templatePath);
            String html = template;
            for (Map.Entry<String, String> entry : values.entrySet()) {
                html = html.replace("{{" + entry.getKey() + "}}", entry.getValue() == null ? "" : entry.getValue());
            }
            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.useFastMode();
                builder.withHtmlContent(html, null);
                builder.toStream(out);
                builder.run();
                return out.toByteArray();
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to generate receipt PDF", e);
        }
    }

    private String loadTemplate(String path) throws IOException {
        try (InputStream in = new ClassPathResource(path).getInputStream()) {
            return StreamUtils.copyToString(in, StandardCharsets.UTF_8);
        }
    }

    private String accountCurrency(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber).map(Account::getCurrency).orElse("NGN");
    }

    private String accountRow(String label, String accountNumber) {
        return row(label, escapeHtml(accountNumber));
    }

    private static String row(String label, String valueHtml) {
        return "<tr><td class=\"label\">" + escapeHtml(label) + "</td>"
                + "<td class=\"value\">" + valueHtml + "</td></tr>";
    }

    private static String money(BigDecimal amount) {
        return amount == null ? "0.00" : amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static boolean isPending(String status) {
        return status == null || "PENDING".equalsIgnoreCase(status) || "PROCESSING".equalsIgnoreCase(status);
    }

    private static String escapeHtml(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}