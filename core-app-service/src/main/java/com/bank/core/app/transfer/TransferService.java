package com.bank.core.app.transfer;

import com.bank.common.dto.transfer.TransferRequest;
import com.bank.common.dto.transfer.TransferResponse;

import java.util.List;
import java.util.UUID;

public interface TransferService {

    TransferResponse initiate(TransferRequest request);

    List<TransferResponse> findAll();

    TransferResponse findById(UUID id);

    TransferResponse reverse(UUID id);
}