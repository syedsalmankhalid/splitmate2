import { useCallback, useMemo, useState } from 'react'
import { getExpensesForGroup, getGroupById, getGroupMembers } from '../data/storage'

// Loads a group with its members and live (non-deleted) expenses.
// Call refresh() after writing to storage to re-read everything.
export function useGroup(groupId) {
  const [version, setVersion] = useState(0)

  const data = useMemo(() => {
    const group = getGroupById(groupId)
    if (!group) return { group: null, members: [], expenses: [], version }
    const expenses = getExpensesForGroup(groupId).sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    )
    return { group, members: getGroupMembers(group), expenses, version }
  }, [groupId, version])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  return { group: data.group, members: data.members, expenses: data.expenses, refresh }
}
