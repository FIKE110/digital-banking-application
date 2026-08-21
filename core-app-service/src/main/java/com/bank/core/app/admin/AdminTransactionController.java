package com.bank.core.app.admin;

import com.bank.common.dto.transaction.TransactionResponse;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/transactions")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage-admin')")
public class AdminTransactionController {

    private final AdminTransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> listTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) String search) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess("Transactions fetched successfully",
                transactionService.listTransactions(accountNumber, type, status, fromDate, toDate,
                        minAmount, maxAmount, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(@PathVariable UUID id) {
        return ApiResponseUtil.buildSuccess("Transaction fetched successfully",
                transactionService.getTransaction(id));
    }

    @PostMapping("/{id}/reverse")
    public ResponseEntity<ApiResponse<TransactionResponse>> reverseTransaction(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest httpRequest) {
        String reason = body != null ? body.get("reason") : null;
        return ApiResponseUtil.buildSuccess("Transaction reversed",
                transactionService.reverseTransaction(id, reason, httpRequest));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<TransactionResponse>> refundTransaction(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest httpRequest) {
        String reason = body != null ? body.get("reason") : null;
        return ApiResponseUtil.buildSuccess("Transaction refunded",
                transactionService.refundTransaction(id, reason, httpRequest));
    }

    @PostMapping("/{id}/hold")
    public ResponseEntity<ApiResponse<TransactionResponse>> holdTransaction(
            @PathVariable UUID id, HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Transaction placed on hold",
                transactionService.holdTransaction(id, httpRequest));
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<ApiResponse<TransactionResponse>> releaseTransaction(
            @PathVariable UUID id, HttpServletRequest httpRequest) {
        return ApiResponseUtil.buildSuccess("Transaction released from hold",
                transactionService.releaseTransaction(id, httpRequest));
    }
}