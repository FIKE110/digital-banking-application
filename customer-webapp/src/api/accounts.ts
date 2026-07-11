import client from './client';

export const createAccount = (data: {
  accountName: string;
  accountType: string;
  currency: string;
  openingBalance: number;
  status: string;
}) => client.post('/accounts', data).then(r => r.data);

export const getAccounts = () =>
  client.get('/accounts').then(r => r.data);

export const getAccount = (id: string) =>
  client.get(`/accounts/${id}`).then(r => r.data);

export const getBalance = (id: string) =>
  client.get(`/accounts/${id}/balance`).then(r => r.data);

export const updateAccountStatus = (id: string, status: string) =>
  client.patch(`/accounts/${id}/status`, { status }).then(r => r.data);

export const updateBalance = (id: string, balance: number) =>
  client.patch(`/accounts/${id}/balance`, balance).then(r => r.data);
