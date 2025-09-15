export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `ORD${year}${month}${day}${random}`;
}

export function calculateLoyaltyPoints(amount: number): number {
  // Example: 1 point per 100 LKR spent
  return Math.floor(amount / 100);
}
