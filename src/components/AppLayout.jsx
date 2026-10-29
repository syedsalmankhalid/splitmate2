import { startTransition } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // React Router navigates inside a transition; logging out in the same transition
  // stops ProtectedRoute from bouncing to /login before we reach the landing page.
  function handleLogout() {
    startTransition(() => {
      logout()
      navigate('/')
    })
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 h-14 border-b border-line bg-surface">
        <div className="mx-auto flex h-full max-w-page items-center justify-between px-4">
          <Logo to="/dashboard" />
          <div className="flex items-center gap-4 text-sm">
            <span className="text-ink-secondary">{user.name}</span>
            <button onClick={handleLogout} className="text-ink-muted hover:text-ink">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-page px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
