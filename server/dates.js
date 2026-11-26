// Turns a date from a form ("2026-11-28T10:30", with or without seconds)
// into the format SQL Server expects ("2026-11-28 10:30:00").
// Returns null if the value is not a date + time.
export function toSqlDateTime(value) {
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(value || ''));
  if (!match) return null;
  const [, day, hours, minutes, seconds = '00'] = match;
  return `${day} ${hours}:${minutes}:${seconds}`;
}
