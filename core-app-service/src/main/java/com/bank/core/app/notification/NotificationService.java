package com.bank.core.app.notification;

import com.bank.common.dto.notification.NotificationPreferenceResponse;
import com.bank.common.dto.notification.NotificationResponse;
import com.bank.common.dto.notification.UpdateNotificationPreferencesRequest;
import com.bank.common.wrapper.PaginatedResponse;

import java.util.UUID;

public interface NotificationService {

    PaginatedResponse<NotificationResponse> getNotifications(int page, int size);

    long getUnreadCount();

    NotificationResponse markRead(UUID id);

    void markAllRead();

    NotificationPreferenceResponse getPreferences();

    NotificationPreferenceResponse updatePreferences(UpdateNotificationPreferencesRequest request);

    void notify(Long userId, String type, String title, String body);
}
