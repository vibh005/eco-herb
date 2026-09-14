import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, if a token exists, verify it with the server
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    api.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // Redirect browser to backend Google OAuth — no popup needed
  const signInWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`
  }

  const signOut = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // Called by AuthCallback page after OAuth redirect
  const saveToken = (token) => {
    localStorage.setItem('token', token)
    api.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {})
  }

  const isAdmin = Boolean(user?.is_admin)

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, saveToken, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
