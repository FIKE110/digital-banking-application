package com.bank.core.app.card;

import com.bank.common.dto.card.CardResponse;
import com.bank.common.dto.card.ChangeCardPinRequest;
import com.bank.common.dto.card.CreateCardRequest;
import com.bank.common.dto.card.UpdateCardLimitsRequest;
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
import static com.bank.common.constant.ApiConstant.CARD_BASE;

@RestController
@RequestMapping(API_V1_PATH + CARD_BASE)
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping
    public ResponseEntity<ApiResponse<CardResponse>> create(@Valid @RequestBody CreateCardRequest request) {
        CardResponse response = cardService.create(request);
        return ApiResponseUtil.buildSuccess(HttpStatus.CREATED.value(), "Card created successfully", response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CardResponse>>> list() {
        List<CardResponse> cards = cardService.findAll();
        return ApiResponseUtil.buildSuccess("Cards fetched successfully", cards);
    }

    @PostMapping("/{id}/freeze")
    public ResponseEntity<ApiResponse<CardResponse>> freeze(@PathVariable UUID id) {
        CardResponse response = cardService.freeze(id);
        return ApiResponseUtil.buildSuccess("Card frozen successfully", response);
    }

    @PostMapping("/{id}/unfreeze")
    public ResponseEntity<ApiResponse<CardResponse>> unfreeze(@PathVariable UUID id) {
        CardResponse response = cardService.unfreeze(id);
        return ApiResponseUtil.buildSuccess("Card unfrozen successfully", response);
    }

    @PostMapping("/{id}/replace")
    public ResponseEntity<ApiResponse<CardResponse>> replace(@PathVariable UUID id) {
        CardResponse response = cardService.replace(id);
        return ApiResponseUtil.buildSuccess("Card replaced successfully", response);
    }

    @PutMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<CardResponse>> changePin(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeCardPinRequest request) {
        CardResponse response = cardService.changePin(id, request);
        return ApiResponseUtil.buildSuccess("Card PIN changed successfully", response);
    }

    @PatchMapping("/{id}/limits")
    public ResponseEntity<ApiResponse<CardResponse>> updateLimits(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCardLimitsRequest request) {
        CardResponse response = cardService.updateLimits(id, request);
        return ApiResponseUtil.buildSuccess("Card limits updated successfully", response);
    }
}
