package com.bank.core.app.kyc;

import com.bank.common.constant.ApiConstant;
import com.bank.common.dto.kyc.KycStatusResponse;
import com.bank.common.dto.kyc.KycSubmitRequest;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstant.API_V1_PATH + "/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @GetMapping
    public ResponseEntity<ApiResponse<KycStatusResponse>> getStatus() {
        return ApiResponseUtil.buildSuccess("KYC status fetched successfully",
                kycService.getStatus());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KycStatusResponse>> submit(@Valid @RequestBody KycSubmitRequest request) {
        return ApiResponseUtil.buildSuccess("KYC submitted for review", kycService.submit(request));
    }
}