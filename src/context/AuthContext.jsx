import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService.js'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false)
  useEffect(() => { authService.me().then(setUser).finally(() => setReady(true)) }, [])
  const login = async (e, p) => { const u = await authService.login(e, p); setUser(u); return u }
  const logout = () => { authService.logout(); setUser(null) }
  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>
}
