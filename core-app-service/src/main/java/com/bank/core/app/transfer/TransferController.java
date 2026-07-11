package com.bank.core.app.transfer;

import com.bank.common.dto.transfer.TransferRequest;
import com.bank.common.dto.transfer.TransferResponse;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static com.bank.common.constant.ApiConstant.API_V1_PATH;
import static com.bank.common.constant.ApiConstant.TRANSFER_BASE;

@RestController
@RequestMapping(API_V1_PATH + TRANSFER_BASE)
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @PostMapping
    public ResponseEntity<ApiResponse<TransferResponse>> initiate(@Valid @RequestBody TransferRequest request) {
        TransferResponse response = transferService.initiate(request);
        return ApiResponseUtil.buildSuccess(HttpStatus.CREATED.value(), "Transfer completed successfully", response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransferResponse>>> list() {
        List<TransferResponse> transfers = transferService.findAll();
        return ApiResponseUtil.buildSuccess("Transfers fetched successfully", transfers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransferResponse>> get(@PathVariable UUID id) {
        TransferResponse transfer = transferService.findById(id);
        return ApiResponseUtil.buildSuccess("Transfer fetched successfully", transfer);
    }

    @PostMapping("/{id}/reverse")
    public ResponseEntity<ApiResponse<TransferResponse>> reverse(@PathVariable UUID id) {
        TransferResponse reversal = transferService.reverse(id);
        return ApiResponseUtil.buildSuccess("Transfer reversed successfully", reversal);
    }
}