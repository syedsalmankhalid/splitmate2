import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    try {
      login(email, password)
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to see your groups and balances."
      footer={
        <>
          New to Splitmate?{' '}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Sign in
        </button>
      </form>
    </AuthCard>
  )
}
