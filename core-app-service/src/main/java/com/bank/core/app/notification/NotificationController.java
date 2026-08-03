package com.bank.core.app.notification;

import com.bank.common.constant.ApiConstant;
import com.bank.common.dto.notification.NotificationPreferenceResponse;
import com.bank.common.dto.notification.NotificationResponse;
import com.bank.common.dto.notification.UpdateNotificationPreferencesRequest;
import com.bank.common.util.ApiResponseUtil;
import com.bank.common.wrapper.ApiResponse;
import com.bank.common.wrapper.PaginatedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstant.API_V1_PATH + ApiConstant.NOTIFICATION_BASE)
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<NotificationResponse>>> list(
            @RequestParam(name = ApiConstant.PAGE_NUMBER, defaultValue = "0") int page,
            @RequestParam(name = ApiConstant.PAGE_SIZE, defaultValue = "20") int size) {
        return ApiResponseUtil.buildSuccess("Notifications fetched successfully",
                notificationService.getNotifications(page, size));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount() {
        return ApiResponseUtil.buildSuccess("Unread count fetched successfully",
                notificationService.getUnreadCount());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(@PathVariable UUID id) {
        return ApiResponseUtil.buildSuccess("Notification marked as read", notificationService.markRead(id));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationService.markAllRead();
        return ApiResponseUtil.buildSuccess("All notifications marked as read", null);
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getPreferences() {
        return ApiResponseUtil.buildSuccess("Preferences fetched successfully", notificationService.getPreferences());
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updatePreferences(
            @Valid @RequestBody UpdateNotificationPreferencesRequest request) {
        return ApiResponseUtil.buildSuccess("Preferences updated successfully",
                notificationService.updatePreferences(request));
    }
}
