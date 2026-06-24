export function getInitials(name: string | null | undefined) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  return parts
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatTimeOfDay(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDuration(checkIn: string, checkOut: string | null | undefined) {
  if (!checkOut) return '—'
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  if (ms <= 0) return '—'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  if (date >= startOfToday) {
    return formatTimeOfDay(value)
  }
  if (date >= startOfYesterday) {
    return 'Yesterday'
  }
  return formatShortDate(value)
}

export function formatCurrency(amount: number | string | null | undefined) {
  const n = Number(amount ?? 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
