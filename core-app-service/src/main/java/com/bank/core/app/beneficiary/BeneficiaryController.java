package com.bank.core.app.beneficiary;

import com.bank.common.dto.beneficiary.BeneficiaryRequest;
import com.bank.common.dto.beneficiary.BeneficiaryResponse;
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
import static com.bank.common.constant.ApiConstant.BENEFICIARY_BASE;

@RestController
@RequestMapping(API_V1_PATH + BENEFICIARY_BASE)
@RequiredArgsConstructor
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> list() {
        List<BeneficiaryResponse> beneficiaries = beneficiaryService.findAll();
        return ApiResponseUtil.buildSuccess("Beneficiaries fetched successfully", beneficiaries);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> create(@Valid @RequestBody BeneficiaryRequest request) {
        BeneficiaryResponse response = beneficiaryService.create(request);
        return ApiResponseUtil.buildSuccess(HttpStatus.CREATED.value(), "Beneficiary added successfully", response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable UUID id) {
        beneficiaryService.delete(id);
        return ApiResponseUtil.buildSuccess("Beneficiary deleted successfully", null);
    }
}
