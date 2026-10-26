import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
const ROLE = { member: 'Member', manager: 'Project Manager', admin: 'Workspace Admin', super: 'Super Admin' }
const NAV = [['dashboard', 'Dashboard'], ['tasks', 'Tasks'], ['projects', 'Projects'], ['board', 'Kanban board', ['manager', 'admin']], ['admin', 'People & settings', ['admin', 'super']]]
export default function Layout() {
  const { user, logout } = useAuth(), nav = useNavigate()
  return <div className="app">
    <aside className="side"><h2>TeamSync</h2>
      <nav aria-label="Main">{NAV.filter(([, , r]) => !r || r.includes(user.role)).map(([to, l]) => <NavLink key={to} to={to}>{l}</NavLink>)}</nav>
      <div className="me"><b>{user.name}</b><small>{ROLE[user.role]}</small><button className="btn ghost" onClick={() => { logout(); nav('/login') }}>Log out</button></div></aside>
    <main className="main"><Outlet /></main></div>
}
