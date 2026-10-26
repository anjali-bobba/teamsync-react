import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Loading } from '../components/common/ui.jsx'
// Requires a session; with `roles`, also requires one of those roles.
export default function Protected({ roles }) {
  const { user, ready } = useAuth(), loc = useLocation()
  if (!ready) return <Loading />
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/app/dashboard" replace />
  return <Outlet />
}
