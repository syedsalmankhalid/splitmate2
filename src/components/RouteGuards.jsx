import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Landing, login and register send signed-in users straight to their dashboard.
export function PublicOnlyRoute() {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
