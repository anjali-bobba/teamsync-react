// Mock REST client persisted in localStorage. Services depend only on get/post/patch,
// so replacing this file's internals with fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`) targets Spring Boot.
import { seed } from '../../data/db.js'
const KEY = 'teamsync_db'
let db
try { db = JSON.parse(localStorage.getItem(KEY)) } catch { db = null }
db = db || structuredClone(seed)
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* storage unavailable */ } }
const reply = v => new Promise(r => setTimeout(() => r(structuredClone(v)), 150))
const fail = (message, status = 404) => Promise.reject(Object.assign(new Error(message), { status }))
export const api = {
  get(path, params = {}) {
    const [, res, id] = path.split('/'); const col = db[res]
    if (!col) return fail(`Unknown resource: ${res}`)
    if (id) { const x = col.find(i => i.id === id); return x ? reply(x) : fail(`${res.slice(0, -1)} "${id}" was not found`) }
    return reply(col.filter(i => Object.entries(params).every(([k, v]) => !v || i[k] === v)))
  },
  post(path, body) {
    const res = path.split('/')[1]; if (!db[res]) return fail(`Unknown resource: ${res}`)
    const item = { ...body, id: res[0] + Date.now() }; db[res].push(item); save(); return reply(item)
  },
  patch(path, body) {
    const [, res, id] = path.split('/'); const i = db[res]?.findIndex(x => x.id === id)
    if (i == null || i < 0) return fail(`${res} "${id}" was not found`)
    db[res][i] = { ...db[res][i], ...body, updatedAt: new Date().toISOString() }; save(); return reply(db[res][i])
  },
  reset() { db = structuredClone(seed); save() },
}
