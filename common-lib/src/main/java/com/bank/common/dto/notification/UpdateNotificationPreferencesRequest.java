package com.bank.common.dto.notification;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNotificationPreferencesRequest {

    @NotNull
    private Boolean securityAlerts;

    @NotNull
    private Boolean transactionAlerts;

    @NotNull
    private Boolean promotionalUpdates;
}
