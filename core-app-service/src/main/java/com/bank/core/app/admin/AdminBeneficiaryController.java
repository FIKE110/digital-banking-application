package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminBeneficiaryResponse;
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

import java.util.Map;
import java.util.UUID;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/beneficiaries")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage-admin')")
public class AdminBeneficiaryController {

    private final AdminBeneficiaryService beneficiaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminBeneficiaryResponse>>> listBeneficiaries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long userId) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess("Beneficiaries fetched successfully",
                beneficiaryService.listBeneficiaries(search, userId, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBeneficiary(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request) {
        beneficiaryService.deleteBeneficiary(id, request);
        return ApiResponseUtil.buildSuccess("Beneficiary removed", "Deleted");
    }
}