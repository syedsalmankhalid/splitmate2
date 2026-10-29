export const CATEGORIES = [
  { id: 'food', label: 'Food' },
  { id: 'transport', label: 'Transport' },
  { id: 'stay', label: 'Stay' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'other', label: 'Other' },
]

export const DEFAULT_CATEGORY = 'other'

// Expenses saved before categories existed have no category; they read as "Other".
export function getCategory(id) {
  return (
    CATEGORIES.find((c) => c.id === id) ?? CATEGORIES.find((c) => c.id === DEFAULT_CATEGORY)
  )
}
