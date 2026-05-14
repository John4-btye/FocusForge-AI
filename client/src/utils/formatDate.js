export function formatDate(value) {
  // Keep empty/null API dates readable in task and session rows.
  if (!value) return 'No date'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
