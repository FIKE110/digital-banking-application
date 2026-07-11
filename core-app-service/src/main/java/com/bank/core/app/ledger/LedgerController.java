package com.bank.core.app.ledger;

import com.bank.common.dto.transaction.TransactionResponse;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static com.bank.common.constant.ApiConstant.API_V1_PATH;
import static com.bank.common.constant.ApiConstant.LEDGER_BASE;

@RestController
@RequestMapping(API_V1_PATH + LEDGER_BASE)
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> listTransactions() {
        List<TransactionResponse> transactions = ledgerService.getTransactions();
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