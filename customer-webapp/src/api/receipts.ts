import client from './client';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const downloadTransferReceipt = async (id: string) => {
  const res = await client.get<Blob>(`/receipts/transfers/${id}`, { responseType: 'blob' });
  downloadBlob(res.data, `receipt-transfer-${id}.pdf`);
};

export const downloadBillReceipt = async (id: string) => {
  const res = await client.get<Blob>(`/receipts/bills/${id}`, { responseType: 'blob' });
  downloadBlob(res.data, `receipt-bill-${id}.pdf`);
};

export const downloadStatement = async (accountNumber: string, month?: string) => {
  const res = await client.get<Blob>(`/receipts/statements/${accountNumber}`, {
    responseType: 'blob',
    params: month ? { month } : undefined,
  });
  downloadBlob(res.data, `statement-${accountNumber}-${month ?? 'current'}.pdf`);
};