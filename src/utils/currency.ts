export function formatINR(price: number): string {
  return `₹${Math.round(price).toLocaleString('en-IN')}`;
}