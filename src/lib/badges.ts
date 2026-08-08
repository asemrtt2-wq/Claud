export function isNewBook(createdAt: Date, days = 14) {
  return Date.now() - createdAt.getTime() < days * 86400000;
}
