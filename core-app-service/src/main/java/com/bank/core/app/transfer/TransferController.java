package com.bank.core.app.transfer;

import org.springframework.web.bind.annotation.*;

import static com.bank.common.constant.ApiConstant.TRANSFER_BASE;

@RestController
@RequestMapping(TRANSFER_BASE)
public class TransferController {

    @PostMapping
    public String initiate() {
        return "TRANSFER_INITIATED";
    }

    @GetMapping
    public String list() {
        return "TRANSFERS_FETCHED";
    }

    @GetMapping("/{id}")
    public String get() {
        return "TRANSFER_FETCHED";
    }

    @PostMapping("/{id}/reverse")
    public String reverse() {
        return "TRANSFER_REVERSED";
    }
}
