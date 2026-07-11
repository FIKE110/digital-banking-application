import client from './client';

export const initiateTransfer = (data: {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  description?: string;
}) => client.post('/transfers', data).then(r => r.data);

export const getTransfers = () =>
  client.get('/transfers').then(r => r.data);

export const getTransfer = (id: string) =>
  client.get(`/transfers/${id}`).then(r => r.data);

export const reverseTransfer = (id: string) =>
  client.post(`/transfers/${id}/reverse`).then(r => r.data);
