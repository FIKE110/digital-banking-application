package com.bank.extern.email.controller;

import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import com.bank.extern.email.model.EmailDelivery;
import com.bank.extern.email.model.EmailDeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/email-deliveries")
@RequiredArgsConstructor
public class EmailDeliveryController {

    private final EmailDeliveryRepository deliveryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmailDelivery>>> list() {
        List<EmailDelivery> items = deliveryRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ApiResponseUtil.buildSuccess(200, "Email notifications fetched", items);
    }
}