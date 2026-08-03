package com.bank.core.app.admin;

import com.bank.common.dto.bill.BillPaymentResponse;
import com.bank.common.dto.bill.BillerCatalogResponse;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage-admin')")
public class AdminBillPaymentController {

    private final AdminBillPaymentService billPaymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BillPaymentResponse>>> listPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess("Payments fetched successfully",
                billPaymentService.listPayments(provider, status, fromDate, toDate, minAmount, maxAmount, pageable));
    }

    @GetMapping("/providers")
    public ResponseEntity<ApiResponse<List<BillerCatalogResponse>>> listProviders() {
        return ApiResponseUtil.buildSuccess("Providers fetched successfully",
                billPaymentService.listProviders());
    }
}