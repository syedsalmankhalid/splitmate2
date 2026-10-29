import { createContext, useContext, useState } from 'react'
import * as storage from '../data/storage'

const AuthContext = createContext(null)

// Never hand the password around the app.
const toPublicUser = (user) => user && { id: user.id, name: user.name, email: user.email }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const userId = storage.getSessionUserId()
    return userId ? toPublicUser(storage.getUserById(userId)) : null
  })

  function login(email, password) {
    const found = storage.getUserByEmail(email)
    if (!found || found.password !== password) {
      throw new Error('Invalid email or password.')
    }
    storage.setSessionUserId(found.id)
    setUser(toPublicUser(found))
  }

  function register({ name, email, password }) {
    const created = storage.createUser({ name, email, password })
    storage.setSessionUserId(created.id)
    setUser(toPublicUser(created))
  }

  function logout() {
    storage.clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
