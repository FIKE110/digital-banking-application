package com.bank.common.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceResponse {

    private boolean securityAlerts;
    private boolean transactionAlerts;
    private boolean promotionalUpdates;
}
