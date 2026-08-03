const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '\u20A6',
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  GHS: '\u20B5',
  KES: 'KSh ',
  ZAR: 'R ',
};

export function formatMoney(amount: number | string | null | undefined, currency = 'NGN'): string {
  const value = Number(amount ?? 0);
  if (!Number.isFinite(value)) return '-';
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency} `;
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}
