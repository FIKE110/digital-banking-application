package com.bank.core.app.admin;

import com.bank.common.dto.admin.AccountTypeLimitResponse;
import com.bank.common.dto.admin.AdminAccountResponse;
import com.bank.common.dto.admin.AuditLogResponse;
import com.bank.common.dto.admin.UpdateAccountStatusRequest;
import com.bank.common.dto.admin.UpdateLimitsRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AdminService {

    Page<AdminAccountResponse> listAccounts(String status, Pageable pageable, HttpServletRequest request);

    AdminAccountResponse updateAccountStatus(UUID id, UpdateAccountStatusRequest request,
                                             HttpServletRequest httpRequest);

    Page<AccountTypeLimitResponse> listLimits(Pageable pageable, HttpServletRequest request);

    AccountTypeLimitResponse updateLimits(String accountType, UpdateLimitsRequest request,
                                          HttpServletRequest httpRequest);

    Page<AuditLogResponse> getAuditLogs(Pageable pageable);
}
