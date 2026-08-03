import client from './client';
import type { ApiResponse, NotificationItem, NotificationPreference } from '../types';

export const getNotifications = (page = 0, size = 20) =>
  client.get<ApiResponse<{ content: NotificationItem[] }>>('/notifications', { params: { page, size } })
    .then(r => r.data);

export const getUnreadCount = () =>
  client.get<ApiResponse<number>>('/notifications/unread-count').then(r => r.data);

export const markNotificationRead = (id: string) =>
  client.post<ApiResponse<NotificationItem>>(`/notifications/${id}/read`).then(r => r.data);

export const markAllNotificationsRead = () =>
  client.post<ApiResponse<null>>('/notifications/read-all').then(r => r.data);

export const getNotificationPreferences = () =>
  client.get<ApiResponse<NotificationPreference>>('/notifications/preferences').then(r => r.data);

export const updateNotificationPreferences = (prefs: NotificationPreference) =>
  client.put<ApiResponse<NotificationPreference>>('/notifications/preferences', prefs).then(r => r.data);
