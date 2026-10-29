import Logo from './Logo'

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="card mt-8 w-full max-w-sm">
        <h1 className="text-xl text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-6 text-sm text-ink-secondary">{footer}</div>}
    </div>
  )
}
