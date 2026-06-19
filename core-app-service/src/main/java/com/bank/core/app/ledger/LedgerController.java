package com.bank.core.app.ledger;

import org.springframework.web.bind.annotation.*;

import static com.bank.common.constant.ApiConstant.LEDGER_BASE;

@RestController
@RequestMapping(LEDGER_BASE)
public class LedgerController {

    @GetMapping("/transactions")
    public String listTransactions() {
        return "TRANSACTIONS_FETCHED";
    }

    @GetMapping("/transactions/{id}")
    public String getTransaction() {
        return "TRANSACTION_FETCHED";
    }

    @GetMapping("/accounts/{id}/entries")
    public String accountEntries() {
        return "LEDGER_ENTRIES_FETCHED";
    }
}
