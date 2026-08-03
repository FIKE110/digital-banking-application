package com.bank.core.app.notification;

import com.bank.common.dto.notification.NotificationPreferenceResponse;
import com.bank.common.dto.notification.NotificationResponse;
import com.bank.common.dto.notification.UpdateNotificationPreferencesRequest;
import com.bank.common.wrapper.PaginatedResponse;
import com.bank.core.app.util.SecurityUtil;
import com.bank.core.data.notification.Notification;
import com.bank.core.data.notification.NotificationPreference;
import com.bank.core.data.notification.NotificationPreferenceRepository;
import com.bank.core.data.notification.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    public static final String TYPE_SECURITY = "SECURITY";
    public static final String TYPE_CREDIT = "CREDIT";
    public static final String TYPE_DEBIT = "DEBIT";
    public static final String TYPE_SYSTEM = "SYSTEM";

    private static final int MAX_PAGE_SIZE = 100;

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<NotificationResponse> getNotifications(int page, int size) {
        Long userId = securityUtil.currentUserId();
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Page<Notification> result = notificationRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        return PaginatedResponse.from(result.map(this::mapToResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByUserIdAndReadFalse(securityUtil.currentUserId());
    }

    @Override
    @Transactional
    public NotificationResponse markRead(UUID id) {
        Long userId = securityUtil.currentUserId();
        Notification notification = notificationRepository.findByUserIdAndId(userId, id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        return mapToResponse(notification);
    }

    @Override
    @Transactional
    public void markAllRead() {
        Long userId = securityUtil.currentUserId();
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, MAX_PAGE_SIZE))
                .getContent().stream()
                .filter(n -> !n.isRead())
                .forEach(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getPreferences() {
        return mapToResponse(getOrCreatePreferences(securityUtil.currentUserId()));
    }

    @Override
    @Transactional
    public NotificationPreferenceResponse updatePreferences(UpdateNotificationPreferencesRequest request) {
        Long userId = securityUtil.currentUserId();
        NotificationPreference preference = getOrCreatePreferences(userId);
        preference.setSecurityAlerts(request.getSecurityAlerts());
        preference.setTransactionAlerts(request.getTransactionAlerts());
        preference.setPromotionalUpdates(request.getPromotionalUpdates());
        return mapToResponse(preferenceRepository.save(preference));
    }

    @Override
    @Transactional
    public void notify(Long userId, String type, String title, String body) {
        if (userId == null) return;
        NotificationPreference preference = getOrCreatePreferences(userId);
        if (TYPE_SECURITY.equals(type) && !preference.isSecurityAlerts()) return;
        if ((TYPE_CREDIT.equals(type) || TYPE_DEBIT.equals(type)) && !preference.isTransactionAlerts()) return;
        if (!TYPE_SYSTEM.equals(type) && !TYPE_SECURITY.equals(type)
                && !TYPE_CREDIT.equals(type) && !TYPE_DEBIT.equals(type)) {
            if (!preference.isPromotionalUpdates()) return;
        }
        notificationRepository.save(Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .build());
    }

    private NotificationPreference getOrCreatePreferences(Long userId) {
        return preferenceRepository.findByUserId(userId).orElseGet(() ->
                preferenceRepository.save(NotificationPreference.builder().userId(userId).build()));
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .body(notification.getBody())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private NotificationPreferenceResponse mapToResponse(NotificationPreference preference) {
        return NotificationPreferenceResponse.builder()
                .securityAlerts(preference.isSecurityAlerts())
                .transactionAlerts(preference.isTransactionAlerts())
                .promotionalUpdates(preference.isPromotionalUpdates())
                .build();
    }
}
