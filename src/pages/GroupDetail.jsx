import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AddExpenseModal from '../components/AddExpenseModal'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { addExpense, softDeleteExpense } from '../data/storage'
import { useGroup } from '../hooks/useGroup'
import { computeNetBalances, simplifyDebts } from '../utils/balances'
import { getCategory } from '../utils/categories'
import { formatDate, formatMoney } from '../utils/format'

// A payment the current user makes or receives: full colour, amount front and centre.
function MySettlement({ settlement, currentUserId, nameOf }) {
  const iOwe = settlement.from === currentUserId
  return (
    <li
      className={`flex items-center justify-between gap-4 rounded-xl px-5 py-4 ${
        iOwe ? 'bg-negative-soft text-negative' : 'bg-positive-soft text-positive'
      }`}
    >
      <span className="text-base font-semibold">
        {iOwe ? `You owe ${nameOf(settlement.to)}` : `${nameOf(settlement.from)} owes you`}
      </span>
      <span className="text-2xl tabular-nums">{formatMoney(settlement.amountCents)}</span>
    </li>
  )
}

// A payment between two other members: muted.
function OtherSettlement({ settlement, nameOf }) {
  return (
    <li className="flex items-center justify-between gap-4 px-5 py-3 text-sm text-ink-secondary">
      <span>
        {nameOf(settlement.from)} owes {nameOf(settlement.to)}
      </span>
      <span className="font-bold tabular-nums">{formatMoney(settlement.amountCents)}</span>
    </li>
  )
}

export default function GroupDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { group, members, expenses, refresh } = useGroup(id)
  const [isAddingExpense, setIsAddingExpense] = useState(false)

  if (!group || !members.some((m) => m.userId === user.id)) {
    return (
      <div className="card py-12 text-center">
        <p className="text-sm text-ink-muted">This group doesn't exist, or you're not a member.</p>
        <Link to="/dashboard" className="link mt-4 inline-block text-sm">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const activeMembers = members.filter((m) => m.status === 'active')
  const nameOf = (userId) =>
    userId === user.id ? 'You' : (members.find((m) => m.userId === userId)?.name ?? 'Someone')

  // Payments involving the current user come first.
  const involvesMe = (s) => s.from === user.id || s.to === user.id
  const settlements = simplifyDebts(computeNetBalances(expenses)).sort(
    (a, b) => involvesMe(b) - involvesMe(a),
  )
  const mySettlements = settlements.filter(involvesMe)
  const otherSettlements = settlements.filter((s) => !involvesMe(s))

  function handleSaveExpense(expense) {
    addExpense({ ...expense, groupId: group.id, createdBy: user.id })
    setIsAddingExpense(false)
    refresh()
  }

  function handleDeleteExpense(expense) {
    if (!window.confirm(`Delete "${expense.description}"?`)) return
    softDeleteExpense(expense.id, user.id)
    refresh()
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard" className="text-sm text-ink-secondary hover:text-ink">
          ← Back to dashboard
        </Link>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl text-ink">{group.name}</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              {members.length} {members.length === 1 ? 'member' : 'members'} · {expenses.length}{' '}
              {expenses.length === 1 ? 'expense' : 'expenses'}
            </p>
          </div>
          <button onClick={() => setIsAddingExpense(true)} className="btn btn-primary shrink-0">
            Add expense
          </button>
        </div>
      </div>

      <section>
        <h2 className="text-lg text-ink">Balances</h2>
        {settlements.length === 0 ? (
          <div className="card mt-3 py-8 text-center text-sm text-ink-muted">Everyone is settled up.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {mySettlements.length > 0 ? (
              <ul className="space-y-2">
                {mySettlements.map((s) => (
                  <MySettlement
                    key={`${s.from}-${s.to}`}
                    settlement={s}
                    currentUserId={user.id}
                    nameOf={nameOf}
                  />
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-neutral-soft px-5 py-4 text-base font-semibold text-neutral">
                You're all settled in this group
              </p>
            )}
            {otherSettlements.length > 0 && (
              <ul className="card divide-y divide-line p-0">
                {otherSettlements.map((s) => (
                  <OtherSettlement key={`${s.from}-${s.to}`} settlement={s} nameOf={nameOf} />
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg text-ink">Expenses</h2>
        {expenses.length === 0 ? (
          <div className="card mt-3 py-8 text-center text-sm text-ink-muted">
            No expenses yet. Add the first one.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {expenses.map((expense) => (
              <li key={expense.id} className="card flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-ink">{expense.description}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                    <span className="tag">{getCategory(expense.category).label}</span>
                    <span className="truncate">
                      {nameOf(expense.paidBy)} paid · {formatDate(expense.date)}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-lg font-bold tabular-nums text-ink">
                    {formatMoney(expense.amountCents)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense)}
                    className="text-xs text-ink-muted hover:text-danger"
                    aria-label={`Delete ${expense.description}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg text-ink">Members</h2>
        <ul className="card mt-3 divide-y divide-line p-0">
          {members.map((member) => (
            <li key={member.email} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={member.name} />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">
                {member.userId === user.id ? `${member.name} (you)` : member.name}
              </span>
              {member.status === 'pending' ? (
                <span className="badge bg-pending-soft text-pending">pending</span>
              ) : (
                <span className="badge bg-positive-soft text-positive">active</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {isAddingExpense && (
        <AddExpenseModal
          members={activeMembers}
          currentUserId={user.id}
          onSave={handleSaveExpense}
          onClose={() => setIsAddingExpense(false)}
        />
      )}
    </div>
  )
}
