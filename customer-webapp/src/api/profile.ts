import client from './client';

export const getProfile = () =>
  client.get('/profile').then(r => r.data);

export const updateProfile = (data: Record<string, unknown>) =>
  client.put('/profile', data).then(r => r.data);

export const changePassword = (currentPassword: string, newPassword: string) =>
  client.put('/profile/password', { currentPassword, newPassword }).then(r => r.data);

export const changeEmail = (newEmail: string, currentPassword: string) =>
  client.put('/profile/email', { newEmail, currentPassword }).then(r => r.data);
