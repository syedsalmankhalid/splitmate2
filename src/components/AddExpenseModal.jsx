import { useState } from 'react'
import { splitEqually } from '../utils/balances'
import { CATEGORIES, DEFAULT_CATEGORY } from '../utils/categories'
import { formatMoney, parseAmountToCents, todayISODate } from '../utils/format'
import Avatar from './Avatar'
import Modal from './Modal'
import TextField from './TextField'

const SPLIT_MODES = [
  { id: 'equal', label: 'Split equally' },
  { id: 'manual', label: 'Split manually' },
]

function RemainingCounter({ totalCents, remainingCents }) {
  if (remainingCents < 0) {
    return (
      <p className="mt-2 text-right text-sm font-semibold tabular-nums text-danger">
        {formatMoney(-remainingCents)} over
      </p>
    )
  }
  if (remainingCents === 0 && totalCents > 0) {
    return (
      <p className="mt-2 text-right text-sm font-semibold tabular-nums text-positive">
        Adds up to {formatMoney(totalCents)}
      </p>
    )
  }
  return (
    <p className="mt-2 text-right text-sm tabular-nums text-ink-secondary">
      {formatMoney(remainingCents)} left to assign
    </p>
  )
}

// members: active group members only ({ userId, name }).
export default function AddExpenseModal({ members, currentUserId, onSave, onClose }) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(DEFAULT_CATEGORY)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISODate)
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitMode, setSplitMode] = useState('equal')
  const [sharedBy, setSharedBy] = useState(() => new Set(members.map((m) => m.userId)))
  const [manualAmounts, setManualAmounts] = useState({})
  const [error, setError] = useState('')

  const amountCents = parseAmountToCents(amount)
  // Keep member order so leftover cents always land on the same people.
  const sharingIds = members.filter((m) => sharedBy.has(m.userId)).map((m) => m.userId)
  const equalSplits = splitEqually(amountCents, sharingIds)
  const shareOf = Object.fromEntries(equalSplits.map((s) => [s.userId, s.amountCents]))

  // Manual shares are compared in cents so decimals can't drift; $0 shares are left out.
  const manualSplits = members
    .map((m) => ({ userId: m.userId, amountCents: parseAmountToCents(manualAmounts[m.userId] ?? '') }))
    .filter((s) => s.amountCents > 0)
  const remainingCents = amountCents - manualSplits.reduce((sum, s) => sum + s.amountCents, 0)

  const splits = splitMode === 'equal' ? equalSplits : manualSplits

  function toggleShare(userId) {
    const next = new Set(sharedBy)
    if (next.has(userId)) next.delete(userId)
    else next.add(userId)
    setSharedBy(next)
  }

  // Each switch starts the split fresh; the equal-mode ticks are kept.
  function switchMode(mode) {
    if (mode === splitMode) return
    setSplitMode(mode)
    setManualAmounts({})
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!description.trim()) return setError('Say what the expense was for.')
    if (amountCents <= 0) return setError('Enter an amount greater than zero.')
    if (!date) return setError('Pick a date.')
    if (splitMode === 'equal' && sharingIds.length === 0) {
      return setError('Select at least one person to share it.')
    }
    if (splitMode === 'manual') {
      if (manualSplits.length === 0) return setError("Enter at least one person's share.")
      if (remainingCents !== 0) {
        const gap = `${formatMoney(Math.abs(remainingCents))} ${remainingCents > 0 ? 'left' : 'over'}`
        return setError(`Shares must add up to ${formatMoney(amountCents)} (${gap}).`)
      }
    }
    onSave({ description, category, amountCents, date, paidBy, splits })
  }

  return (
    <Modal title="Add expense" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="expense-description"
          label="What was it for?"
          placeholder="e.g. Dinner"
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <label htmlFor="expense-category" className="mb-1.5 block text-sm text-ink">
            Category
          </label>
          <select
            id="expense-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="expense-amount"
            label="Total amount ($)"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <TextField
            id="expense-date"
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="expense-paid-by" className="mb-1.5 block text-sm text-ink">
            Who paid?
          </label>
          <select
            id="expense-paid-by"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="input"
          >
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.userId === currentUserId ? `You (${m.name})` : m.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="sr-only">How to split</legend>
          <div className="mb-2 flex rounded-lg border border-line bg-canvas p-0.5">
            {SPLIT_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={splitMode === mode.id}
                onClick={() => switchMode(mode.id)}
                className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium ${
                  splitMode === mode.id
                    ? 'border-line bg-surface text-ink'
                    : 'border-transparent text-ink-secondary hover:text-ink'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {splitMode === 'equal' ? (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {members.map((m) => (
                <li key={m.userId}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={sharedBy.has(m.userId)}
                      onChange={() => toggleShare(m.userId)}
                      className="h-4 w-4 accent-primary"
                    />
                    <Avatar name={m.name} />
                    <span className="flex-1 text-sm text-ink">
                      {m.userId === currentUserId ? 'You' : m.name}
                    </span>
                    {m.userId in shareOf ? (
                      <span className="text-sm font-bold tabular-nums text-ink">
                        {formatMoney(shareOf[m.userId])}
                      </span>
                    ) : (
                      <span className="text-sm text-ink-muted">—</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {members.map((m) => (
                  <li key={m.userId} className="flex items-center gap-3 px-3 py-2">
                    <Avatar name={m.name} />
                    <label htmlFor={`share-${m.userId}`} className="flex-1 text-sm text-ink">
                      {m.userId === currentUserId ? 'You' : m.name}
                    </label>
                    <div className="relative w-28">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-muted">
                        $
                      </span>
                      <input
                        id={`share-${m.userId}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={manualAmounts[m.userId] ?? ''}
                        onChange={(e) =>
                          setManualAmounts({ ...manualAmounts, [m.userId]: e.target.value })
                        }
                        className="input py-2 pl-6 text-right tabular-nums"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <RemainingCounter totalCents={amountCents} remainingCents={remainingCents} />
            </>
          )}
        </fieldset>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save expense
          </button>
        </div>
      </form>
    </Modal>
  )
}
