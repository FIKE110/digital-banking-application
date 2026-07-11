import client from './client';

export const adminListAccounts = () =>
  client.get('/admin/accounts').then(r => r.data);

export const adminUpdateAccountStatus = (id: string, status: string) =>
  client.patch(`/admin/accounts/${id}/status`, { status }).then(r => r.data);
