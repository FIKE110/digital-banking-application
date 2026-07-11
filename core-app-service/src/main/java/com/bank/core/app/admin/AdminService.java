package com.bank.core.app.admin;

import com.bank.common.dto.admin.AdminAccountResponse;
import com.bank.common.dto.admin.UpdateAccountStatusRequest;

import java.util.List;
import java.util.UUID;

public interface AdminService {

    List<AdminAccountResponse> listAccounts();

    AdminAccountResponse updateAccountStatus(UUID id, UpdateAccountStatusRequest request);
}