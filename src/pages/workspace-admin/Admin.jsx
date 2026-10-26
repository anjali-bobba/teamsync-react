import { useFetch } from '../../hooks/index.js'
import { authService } from '../../services/authService.js'
import { Loading, ErrorBox, Badge } from '../../components/common/ui.jsx'
export default function Admin() {
  const u = useFetch(() => authService.listUsers(), [])
  if (u.loading) return <Loading />
  if (u.error) return <ErrorBox error={u.error} onRetry={u.reload} />
  return <><h1>People & settings</h1><p className="muted">Visible only to Workspace Admin and Super Admin roles.</p>
    <div className="tablewrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>
      {u.data.map(x => <tr key={x.id}><td>{x.name}</td><td>{x.email}</td><td>{x.role}</td><td><Badge kind="Low">{x.status}</Badge></td></tr>)}</tbody></table></div></>
}
