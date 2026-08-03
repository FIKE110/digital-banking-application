package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminCardResponse;
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

import java.util.UUID;

import static com.bank.common.constant.ApiConstant.ADMIN_BASE;
import static com.bank.common.constant.ApiConstant.API_V1_PATH;

@RestController
@RequestMapping(API_V1_PATH + ADMIN_BASE + "/cards")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage-admin')")
public class AdminCardController {

    private final AdminCardService cardService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminCardResponse>>> listCards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String cardType,
            @RequestParam(required = false) String search) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess("Cards fetched successfully",
                cardService.listCards(status, cardType, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminCardResponse>> getCard(@PathVariable UUID id) {
        return ApiResponseUtil.buildSuccess("Card fetched successfully", cardService.getCard(id));
    }

    @PostMapping("/{id}/freeze")
    public ResponseEntity<ApiResponse<AdminCardResponse>> freezeCard(@PathVariable UUID id,
                                                                      HttpServletRequest request) {
        return ApiResponseUtil.buildSuccess("Card frozen", cardService.freezeCard(id, request));
    }

    @PostMapping("/{id}/unfreeze")
    public ResponseEntity<ApiResponse<AdminCardResponse>> unfreezeCard(@PathVariable UUID id,
                                                                        HttpServletRequest request) {
        return ApiResponseUtil.buildSuccess("Card unfrozen", cardService.unfreezeCard(id, request));
    }
}