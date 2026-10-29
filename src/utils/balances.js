// All amounts are integer cents to avoid floating-point drift.

// Splits a total equally; leftover cents go to the first people in the list.
export function splitEqually(totalCents, userIds) {
  if (userIds.length === 0) return []
  const base = Math.floor(totalCents / userIds.length)
  const remainder = totalCents - base * userIds.length
  return userIds.map((userId, i) => ({ userId, amountCents: base + (i < remainder ? 1 : 0) }))
}

// Net position per user: positive = is owed money, negative = owes money.
// Always rebuilt from scratch, skipping soft-deleted expenses.
export function computeNetBalances(expenses) {
  const net = {}
  for (const expense of expenses) {
    if (expense.isDeleted) continue
    net[expense.paidBy] = (net[expense.paidBy] ?? 0) + expense.amountCents
    for (const split of expense.splits) {
      net[split.userId] = (net[split.userId] ?? 0) - split.amountCents
    }
  }
  return net
}

// Pays debtors into creditors, largest first. A set of n people needs at most n - 1 payments.
function settleGreedily(entries) {
  const creditors = entries.filter((e) => e.cents > 0).map((e) => ({ ...e }))
  const debtors = entries.filter((e) => e.cents < 0).map((e) => ({ ...e, cents: -e.cents }))
  creditors.sort((a, b) => b.cents - a.cents)
  debtors.sort((a, b) => b.cents - a.cents)

  const settlements = []
  let d = 0
  let c = 0
  while (d < debtors.length && c < creditors.length) {
    const amountCents = Math.min(debtors[d].cents, creditors[c].cents)
    settlements.push({ from: debtors[d].userId, to: creditors[c].userId, amountCents })
    debtors[d].cents -= amountCents
    creditors[c].cents -= amountCents
    if (debtors[d].cents === 0) d++
    if (creditors[c].cents === 0) c++
  }
  return settlements
}

// The fewest payments = (people with a balance) - (most disjoint groups that each sum to zero).
// Finds that partition with a bitmask DP; exact up to 16 people with a balance, greedy beyond.
const MAX_EXACT = 16

function partitionIntoZeroSumGroups(entries) {
  const n = entries.length
  if (n > MAX_EXACT) return [entries]

  const size = 1 << n
  const sum = new Array(size).fill(0)
  const best = new Array(size).fill(0)
  for (let mask = 1; mask < size; mask++) {
    const lowBit = mask & -mask
    sum[mask] = sum[mask ^ lowBit] + entries[31 - Math.clz32(lowBit)].cents
    let max = 0
    for (let k = 0; k < n; k++) {
      if (mask & (1 << k)) max = Math.max(max, best[mask ^ (1 << k)])
    }
    best[mask] = max + (sum[mask] === 0 ? 1 : 0)
  }

  // Walk back down an optimal chain; each stretch between zero-sum masks is one group.
  const groups = []
  let current = []
  let mask = size - 1
  while (mask) {
    if (sum[mask] === 0 && current.length > 0) {
      groups.push(current)
      current = []
    }
    const bonus = sum[mask] === 0 ? 1 : 0
    for (let k = 0; k < n; k++) {
      if (mask & (1 << k) && best[mask ^ (1 << k)] + bonus === best[mask]) {
        current.push(entries[k])
        mask ^= 1 << k
        break
      }
    }
  }
  if (current.length > 0) groups.push(current)
  return groups
}

export function simplifyDebts(net) {
  const entries = Object.entries(net)
    .filter(([, cents]) => cents !== 0)
    .map(([userId, cents]) => ({ userId, cents }))
  return partitionIntoZeroSumGroups(entries).flatMap(settleGreedily)
}
