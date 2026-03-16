export function formatCurrency(
  amount: number | undefined | null,
  currency = 'PKR',
  locale = 'en-PK',
): string {
  if (amount === undefined || amount === null) return '—'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('en').format(value)
}
