package com.bank.core.app.bill;

import com.bank.common.dto.bill.BillerCatalogResponse;
import com.bank.common.dto.bill.BillPaymentRequest;
import com.bank.common.dto.bill.BillPaymentResponse;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.bank.common.constant.ApiConstant.API_V1_PATH;
import static com.bank.common.constant.ApiConstant.BILL_BASE;

@RestController
@RequestMapping(API_V1_PATH + BILL_BASE)
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<BillPaymentResponse>> pay(@Valid @RequestBody BillPaymentRequest request) {
        BillPaymentResponse response = billService.pay(request);
        return ApiResponseUtil.buildSuccess(HttpStatus.CREATED.value(), "Bill payment completed successfully", response);
    }

    @GetMapping("/catalog")
    public ResponseEntity<ApiResponse<List<BillerCatalogResponse>>> catalog() {
        return ApiResponseUtil.buildSuccess("Biller catalog fetched successfully", billService.getCatalog());
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<BillPaymentResponse>>> list() {
        List<BillPaymentResponse> payments = billService.findAll();
        return ApiResponseUtil.buildSuccess("Bill payments fetched successfully", payments);
    }
}
