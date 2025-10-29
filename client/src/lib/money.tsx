export function formatMoney(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function Money({ amount, className }: { amount: number; className?: string }) {
  return <span className={className}>{formatMoney(amount)}</span>;
}
