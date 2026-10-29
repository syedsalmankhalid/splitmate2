import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

const FEATURES = [
  {
    title: 'Create groups',
    body: 'Start a group for a trip, a flat, or a night out and invite friends by email.',
  },
  {
    title: 'Track shared expenses',
    body: 'Log who paid and who it was for. Splitmate splits it evenly in a tap.',
  },
  {
    title: 'See who owes what',
    body: 'Balances update instantly and settle up in the fewest payments possible.',
  },
]

// A static example of what a group's balances look like inside the app.
function BalancePreview() {
  return (
    <div className="card">
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <p className="text-lg text-ink">Goa trip</p>
        <p className="text-xs text-ink-muted">4 members · 6 expenses</p>
      </div>
      <ul className="mt-4 space-y-2">
        <li className="flex items-center justify-between rounded-xl bg-positive-soft px-4 py-3 text-positive">
          <span className="text-sm font-semibold">Bob owes you</span>
          <span className="text-xl font-extrabold tabular-nums">$200</span>
        </li>
        <li className="flex items-center justify-between rounded-xl bg-negative-soft px-4 py-3 text-negative">
          <span className="text-sm font-semibold">You owe Rahul</span>
          <span className="text-xl font-extrabold tabular-nums">$85</span>
        </li>
        <li className="flex items-center justify-between px-4 py-1 text-sm text-ink-secondary">
          <span>Eva owes Bob</span>
          <span className="font-semibold tabular-nums">$120</span>
        </li>
      </ul>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-14 max-w-page items-center justify-between px-4">
        <Logo />
        <Link to="/login" className="text-sm text-ink-secondary hover:text-ink">
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-page space-y-8 px-4 pb-24">
        <section className="pt-12 sm:pt-20">
          <h1 className="text-2xl text-ink">Share expenses without the awkward math.</h1>
          <p className="mt-3 max-w-lg text-base text-ink-secondary">
            Splitmate keeps track of what everyone paid in your group and tells you exactly who owes
            whom, so settling up takes seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/register" className="btn btn-primary">
              Get started
            </Link>
            <span className="text-sm text-ink-secondary">
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign in
              </Link>
            </span>
          </div>
        </section>

        <BalancePreview />

        <section className="grid gap-2 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card">
              <h2 className="text-base font-semibold text-ink">{feature.title}</h2>
              <p className="mt-1.5 text-sm text-ink-secondary">{feature.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
