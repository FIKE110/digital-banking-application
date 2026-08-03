package com.bank.core.app.ledger;

import com.bank.common.dto.transaction.TransactionResponse;
import com.bank.common.wrapper.PaginatedResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface LedgerService {
    PaginatedResponse<TransactionResponse> getTransactions(int page, int size, String type,
                                                           String accountNumber,
                                                           LocalDateTime from, LocalDateTime to, String search);

    TransactionResponse getTransaction(UUID id);

    List<TransactionResponse> getAccountEntries(String accountNumber);
}
