package com.bank.core.app.bill;

import com.bank.common.dto.bill.BillerCatalogResponse;
import com.bank.common.dto.bill.BillPaymentRequest;
import com.bank.common.dto.bill.BillPaymentResponse;

import java.util.List;

public interface BillService {

    BillPaymentResponse pay(BillPaymentRequest request);

    List<BillPaymentResponse> findAll();

    List<BillerCatalogResponse> getCatalog();
}
