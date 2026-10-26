import { api } from './api/client.js'
const SKEY = 'teamsync_session'
const strip = ({ password, ...u }) => u
export const authService = {
  async login(email, password) {
    const users = await api.get('/users')
    const u = users.find(x => x.email === email.trim().toLowerCase() && x.password === password)
    if (!u) throw new Error('Email or password is incorrect. Try one of the demo accounts below.')
    sessionStorage.setItem(SKEY, u.id); return strip(u)
  },
  async me() { const id = sessionStorage.getItem(SKEY); if (!id) return null; try { return strip(await api.get('/users/' + id)) } catch { return null } },
  logout() { sessionStorage.removeItem(SKEY) },
  async listUsers() { return (await api.get('/users')).map(strip) },
}
