package com.bank.core.app.transfer;

import com.bank.common.dto.transfer.TransferRequest;
import com.bank.common.dto.transfer.TransferResponse;
import com.bank.common.dto.transfer.ResolvedAccountResponse;

import java.util.List;
import java.util.UUID;

public interface TransferService {

    TransferResponse initiate(TransferRequest request);

    ResolvedAccountResponse resolveAccount(String accountNumber);

    List<TransferResponse> findAll();

    TransferResponse findById(UUID id);

    TransferResponse reverse(UUID id);
}