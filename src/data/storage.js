// The only module that reads or writes localStorage.
// When we move to Supabase, swap the internals here and keep the exported functions.

const KEYS = {
  users: 'splitmate.users',
  groups: 'splitmate.groups',
  expenses: 'splitmate.expenses',
  session: 'splitmate.session',
}

const TEST_ACCOUNTS = [
  { name: 'Shubham', email: 'shubham@test.com', password: 'password' },
  { name: 'Bob', email: 'bob@test.com', password: 'password' },
  { name: 'Rahul', email: 'rahul@test.com', password: 'password' },
  { name: 'Eva', email: 'eva@test.com', password: 'password' },
]

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

const newId = () => crypto.randomUUID()
const now = () => new Date().toISOString()

export const normalizeEmail = (email) => email.trim().toLowerCase()

function seedTestAccounts() {
  const users = read(KEYS.users, [])
  const missing = TEST_ACCOUNTS.filter((account) => !users.some((u) => u.email === account.email))
  if (missing.length === 0) return
  const created = missing.map((account) => ({ id: newId(), ...account, createdAt: now() }))
  write(KEYS.users, [...users, ...created])
}

seedTestAccounts()

// --- Users ---

export function getUserById(id) {
  return read(KEYS.users, []).find((u) => u.id === id) ?? null
}

export function getUserByEmail(email) {
  const normalized = normalizeEmail(email)
  return read(KEYS.users, []).find((u) => u.email === normalized) ?? null
}

export function createUser({ name, email, password }) {
  const users = read(KEYS.users, [])
  const normalized = normalizeEmail(email)
  if (users.some((u) => u.email === normalized)) {
    throw new Error('An account with this email already exists.')
  }
  const user = { id: newId(), name: name.trim(), email: normalized, password, createdAt: now() }
  write(KEYS.users, [...users, user])
  return user
}

// --- Session ---

export const getSessionUserId = () => read(KEYS.session, null)
export const setSessionUserId = (userId) => write(KEYS.session, userId)
export const clearSession = () => localStorage.removeItem(KEYS.session)

// --- Groups ---
// Members are stored by email so people without an account can be invited.
// A pending member becomes active as soon as someone registers with that email.

export function createGroup({ name, creator, memberEmails }) {
  const emails = [...new Set([creator.email, ...memberEmails.map(normalizeEmail)])]
  const createdAt = now()
  const group = {
    id: newId(),
    name: name.trim(),
    createdBy: creator.id,
    createdAt,
    members: emails.map((email) => ({ email, addedAt: createdAt })),
  }
  write(KEYS.groups, [...read(KEYS.groups, []), group])
  return group
}

export function getGroupById(id) {
  return read(KEYS.groups, []).find((g) => g.id === id) ?? null
}

export function getGroupsForUser(email) {
  const normalized = normalizeEmail(email)
  return read(KEYS.groups, []).filter((g) => g.members.some((m) => m.email === normalized))
}

export function getGroupMembers(group) {
  const users = read(KEYS.users, [])
  return group.members.map((member) => {
    const user = users.find((u) => u.email === member.email)
    return {
      email: member.email,
      userId: user?.id ?? null,
      name: user?.name ?? member.email,
      status: user ? 'active' : 'pending',
    }
  })
}

// --- Expenses ---
// Expenses are never removed; deleting sets isDeleted so history is kept.

export function getExpensesForGroup(groupId, { includeDeleted = false } = {}) {
  return read(KEYS.expenses, []).filter(
    (e) => e.groupId === groupId && (includeDeleted || !e.isDeleted),
  )
}

export function addExpense({
  groupId,
  description,
  category,
  amountCents,
  date,
  paidBy,
  splits,
  createdBy,
}) {
  const expense = {
    id: newId(),
    groupId,
    description: description.trim(),
    category,
    amountCents,
    date,
    paidBy,
    splits,
    createdBy,
    createdAt: now(),
    isDeleted: false,
  }
  write(KEYS.expenses, [...read(KEYS.expenses, []), expense])
  return expense
}

export function softDeleteExpense(expenseId, deletedBy) {
  const expenses = read(KEYS.expenses, []).map((e) =>
    e.id === expenseId ? { ...e, isDeleted: true, deletedBy, deletedAt: now() } : e,
  )
  write(KEYS.expenses, expenses)
}
