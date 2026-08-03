package com.bank.core.app.admin.approval;

import com.bank.core.app.admin.AdminAdjustmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Component
public class AdjustmentApprovalHandler implements ApprovalActionHandler {

    private static final java.util.Set<String> TYPES =
            java.util.Set.of("MANUAL_CREDIT", "MANUAL_DEBIT", "BALANCE_ADJUSTMENT");

    @Autowired
    @Lazy
    private AdminAdjustmentService adjustmentService;

    @Override
    public boolean supports(String actionType) {
        return TYPES.contains(actionType);
    }

    @Override
    @Transactional
    public void execute(Map<String, Object> actionDetails) {
        String type = (String) actionDetails.get("actionType");
        if (type == null || !TYPES.contains(type)) {
            throw new IllegalStateException("Unsupported adjustment type: " + type);
        }
        com.bank.common.dto.admin.AdjustmentRequest request =
                com.bank.common.dto.admin.AdjustmentRequest.builder()
                        .accountNumber((String) actionDetails.get("accountNumber"))
                        .amount(new BigDecimal((String) actionDetails.get("amount")))
                        .reason((String) actionDetails.get("reason"))
                        .reference((String) actionDetails.get("reference"))
                        .build();
        adjustmentService.executeAdjustment(type, request);
    }
}