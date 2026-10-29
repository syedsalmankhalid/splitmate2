// "$1,800" for whole dollars, "$12.50" otherwise.
export function formatMoney(cents) {
  const hasCents = Math.abs(cents) % 100 !== 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function parseAmountToCents(input) {
  const value = Number.parseFloat(input)
  return Number.isFinite(value) ? Math.round(value * 100) : 0
}

// Dates are stored as local "YYYY-MM-DD" strings.
export function todayISODate() {
  return new Date().toLocaleDateString('en-CA')
}

export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
