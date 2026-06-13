export function prettifyDate(date) {
  const d = new Date(date);
  const hours = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
  const minutes = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${hours}:${minutes}`;
}

export function formatTimeRemaining(expiration) {
  const expirationMs = new Date(expiration).getTime();
  const now = Date.now();
  const diffMs = expirationMs - now;
  if (diffMs <= 0) return "Expired";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}