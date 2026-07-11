package com.bank.core.app.ledger;

import com.bank.common.dto.transaction.TransactionResponse;

import java.util.List;
import java.util.UUID;

public interface LedgerService {

    List<TransactionResponse> getTransactions();

    TransactionResponse getTransaction(UUID id);

    List<TransactionResponse> getAccountEntries(String accountNumber);
}