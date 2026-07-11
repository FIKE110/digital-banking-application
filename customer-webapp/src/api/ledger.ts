import client from './client';

export const getTransactions = () =>
  client.get('/ledger/transactions').then(r => r.data);

export const getTransaction = (id: string) =>
  client.get(`/ledger/transactions/${id}`).then(r => r.data);

export const getAccountEntries = (accountNumber: string) =>
  client.get(`/ledger/accounts/${accountNumber}/entries`).then(r => r.data);
