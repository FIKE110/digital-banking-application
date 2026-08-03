package com.bank.core.app.admin.approval;

import java.util.Map;

public interface ApprovalActionHandler {

    boolean supports(String actionType);

    void execute(Map<String, Object> actionDetails);
}