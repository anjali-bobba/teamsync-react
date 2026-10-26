import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { authService } from '../../services/authService.js'
import { Field } from '../../components/common/ui.jsx'
export default function Login() {
  const { login } = useAuth(), nav = useNavigate(), loc = useLocation()
  const [f, setF] = useState({ email: '', password: '' }), [err, setErr] = useState({}), [demo, setDemo] = useState([])
  useEffect(() => { authService.listUsers().then(u => setDemo(u.filter(x => x.id <= 'u4'))) }, [])
  const go = async (email, password) => {
    const e = {}; if (!email.trim()) e.email = 'Enter your email.'; if (!password) e.password = 'Enter your password.'
    setErr(e); if (Object.keys(e).length) return
    try { await login(email, password); nav(loc.state?.from?.pathname || '/app/dashboard', { replace: true }) } catch (x) { setErr({ form: x.message }) }
  }
  return <div className="login"><div className="card">
    <h1>TeamSync</h1><p>Plan together. Work smarter. Deliver better.</p>
    <form onSubmit={e => { e.preventDefault(); go(f.email, f.password) }} noValidate>
      <Field label="Email" error={err.email}><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} autoComplete="username" /></Field>
      <Field label="Password" error={err.password}><input type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></Field>
      {err.form && <p className="errtxt" role="alert">{err.form}</p>}
      <button className="btn primary" type="submit">Sign in</button></form>
    <h3>Demo access</h3><p className="muted">Password for all demo accounts: demo123</p>
    <div className="row">{demo.map(u => <button key={u.id} className="btn" onClick={() => go(u.email, 'demo123')}>{u.name}<small> {u.role}</small></button>)}</div>
  </div></div>
}
