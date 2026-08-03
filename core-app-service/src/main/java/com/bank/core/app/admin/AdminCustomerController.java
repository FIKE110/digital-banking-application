package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminCustomerDetailResponse;
import com.bank.common.dto.admin.AdminCustomerResponse;
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

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final AdminCustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAuthority('manage-admin')")
    public ResponseEntity<ApiResponse<Page<AdminCustomerResponse>>> listCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess("Customers fetched successfully",
                customerService.listCustomers(search, fromDate, toDate, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('manage-admin')")
    public ResponseEntity<ApiResponse<AdminCustomerDetailResponse>> getCustomer(
            @PathVariable Long id, HttpServletRequest request) {
        return ApiResponseUtil.buildSuccess("Customer fetched successfully",
                customerService.getCustomer(id, request));
    }
}