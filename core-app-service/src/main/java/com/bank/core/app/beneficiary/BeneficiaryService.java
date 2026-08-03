package com.bank.core.app.beneficiary;

import com.bank.common.dto.beneficiary.BeneficiaryRequest;
import com.bank.common.dto.beneficiary.BeneficiaryResponse;

import java.util.List;
import java.util.UUID;

public interface BeneficiaryService {

    List<BeneficiaryResponse> findAll();

    BeneficiaryResponse create(BeneficiaryRequest request);

    void delete(UUID id);
}
