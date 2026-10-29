import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { getExpensesForGroup, getGroupMembers, getGroupsForUser } from '../data/storage'
import { computeNetBalances } from '../utils/balances'
import { formatMoney } from '../utils/format'

const toneFor = (cents) => (cents > 0 ? 'text-positive' : cents < 0 ? 'text-negative' : 'text-ink')

function GroupBalance({ cents }) {
  if (cents === 0) return <span className="pill bg-neutral-soft text-neutral">All settled</span>
  const owed = cents > 0
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className={`pill ${owed ? 'bg-positive-soft text-positive' : 'bg-negative-soft text-negative'}`}>
        {owed ? "You're owed" : 'You owe'}
      </span>
      <span className={`text-xl font-extrabold tabular-nums ${toneFor(cents)}`}>
        {formatMoney(Math.abs(cents))}
      </span>
    </div>
  )
}

function SummaryCard({ label, cents, tone }) {
  return (
    <div className="card">
      <p className="text-xs text-ink-secondary">{label}</p>
      <p className={`mt-2 text-2xl tabular-nums ${tone}`}>{formatMoney(cents)}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  const groups = useMemo(
    () =>
      getGroupsForUser(user.email)
        .map((group) => ({
          ...group,
          memberList: getGroupMembers(group),
          balanceCents: computeNetBalances(getExpensesForGroup(group.id))[user.id] ?? 0,
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [user],
  )

  const owedToYou = groups.reduce((sum, g) => sum + Math.max(g.balanceCents, 0), 0)
  const youOwe = groups.reduce((sum, g) => sum + Math.max(-g.balanceCents, 0), 0)
  const net = owedToYou - youOwe

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl text-ink">Hi, {user.name}</h1>
          <p className="mt-1 text-sm text-ink-secondary">Here's where you stand across your groups.</p>
        </div>
        {groups.length > 0 && (
          <Link to="/group/new" className="btn btn-primary shrink-0">
            New group
          </Link>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <SummaryCard label="Owed to you" cents={owedToYou} tone={toneFor(owedToYou)} />
        <SummaryCard label="You owe" cents={youOwe} tone={toneFor(-youOwe)} />
        <SummaryCard label="Net balance" cents={net} tone={toneFor(net)} />
      </div>

      <section>
        <h2 className="text-lg text-ink">Your groups</h2>
        {groups.length === 0 ? (
          <div className="card mt-3 py-12 text-center">
            <p className="text-sm text-ink-muted">You're not in any groups yet.</p>
            <Link to="/group/new" className="btn btn-primary mt-5">
              Create group
            </Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {groups.map((group) => (
              <li key={group.id}>
                <Link
                  to={`/group/${group.id}`}
                  className="card flex items-center justify-between gap-4 transition-colors hover:border-ink-muted"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-lg text-ink">{group.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {group.memberList.slice(0, 4).map((member) => (
                          <Avatar key={member.email} name={member.name} className="ring-2 ring-surface" />
                        ))}
                      </div>
                      <span className="text-xs text-ink-secondary">
                        {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>
                  <GroupBalance cents={group.balanceCents} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
