package com.bank.core.app.ledger;

import com.bank.common.dto.transaction.TransactionResponse;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import com.bank.common.wrapper.PaginatedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static com.bank.common.constant.ApiConstant.*;

@RestController
@RequestMapping(API_V1_PATH + LEDGER_BASE)
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<PaginatedResponse<TransactionResponse>>> listTransactions(
            @RequestParam(name = PAGE_NUMBER, defaultValue = "0") int page,
            @RequestParam(name = PAGE_SIZE, defaultValue = "20") int size,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "accountNumber", required = false) String accountNumber,
            @RequestParam(name = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "q", required = false) String q) {
        LocalDateTime fromDateTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = to != null ? to.plusDays(1).atStartOfDay() : null;
        PaginatedResponse<TransactionResponse> transactions =
                ledgerService.getTransactions(page, size, type, accountNumber, fromDateTime, toDateTime, q);
        return ApiResponseUtil.buildSuccess("Transactions fetched successfully", transactions);
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(@PathVariable UUID id) {
        TransactionResponse transaction = ledgerService.getTransaction(id);
        return ApiResponseUtil.buildSuccess("Transaction fetched successfully", transaction);
    }

    @GetMapping("/accounts/{id}/entries")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAccountEntries(@PathVariable("id") String accountNumber) {
        List<TransactionResponse> entries = ledgerService.getAccountEntries(accountNumber);
        return ApiResponseUtil.buildSuccess("Ledger entries fetched successfully", entries);
    }
}
