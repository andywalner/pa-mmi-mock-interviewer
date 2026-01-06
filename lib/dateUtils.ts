/**
 * Formats a timestamp from the database to the user's local timezone
 * Database stores timestamps as UTC but without the 'Z' suffix,
 * so we need to explicitly handle them as UTC
 */
export function formatLocalDateTime(
  timestamp: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!timestamp) return '';

  // Ensure the timestamp is treated as UTC by adding 'Z' if not present
  const utcTimestamp = timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`;
  const date = new Date(utcTimestamp);

  return date.toLocaleString(undefined, options);
}
