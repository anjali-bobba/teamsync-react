import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useFetch } from '../../hooks/index.js'
import { taskService } from '../../services/taskService.js'
import { projectService } from '../../services/projectService.js'
import { authService } from '../../services/authService.js'
import { Loading, ErrorBox, Badge } from '../../components/common/ui.jsx'
import { STATUSES, isOverdue, progress } from '../../utils/index.js'
export default function Kanban() {
  const { user } = useAuth(), [pid, setPid] = useState(''), [msg, setMsg] = useState('')
  const t = useFetch(() => taskService.list(), []), p = useFetch(() => projectService.list(), []), u = useFetch(() => authService.listUsers(), [])
  if (t.loading || p.loading) return <Loading />
  if (t.error || p.error) return <ErrorBox error={t.error || p.error} onRetry={() => { t.reload(); p.reload() }} />
  const all = t.data, tasks = all.filter(x => !pid || x.projectId === pid)
  // Optimistic update with rollback; the same handler serves drag-and-drop and the accessible select control.
  const move = async (id, status) => {
    const cur = all.find(x => x.id === id); if (!cur || cur.status === status) return
    setMsg(''); t.setData(all.map(x => x.id === id ? { ...x, status } : x))
    try { await taskService.updateStatus(id, status, user.name); setMsg(`Moved "${cur.title}" to ${status}.`) } catch (e) { setMsg(`Could not move task: ${e.message}`); t.reload() }
  }
  return <><div className="between"><h1>Kanban board</h1>
    <select aria-label="Project" value={pid} onChange={e => setPid(e.target.value)}><option value="">All projects</option>{p.data.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
    <p className="muted">Progress: {progress(tasks)}% complete. Drag cards between columns, or use the status menu on each card.</p><p role="status" aria-live="polite" className="muted">{msg}</p>
    <div className="board">{STATUSES.map(s => <section key={s} className="kcol" aria-label={s} onDragOver={e => e.preventDefault()} onDrop={e => move(e.dataTransfer.getData('id'), s)}>
      <h3>{s} <small>{tasks.filter(x => x.status === s).length}</small></h3>
      {tasks.filter(x => x.status === s).map(x => <article key={x.id} draggable onDragStart={e => e.dataTransfer.setData('id', x.id)} className={`kcard ${isOverdue(x) ? 'overdue' : ''}`}>
        <b>{x.title}</b><div><Badge kind={x.priority}>{x.priority}</Badge> {x.labels.map(l => <small key={l} className="label">{l}</small>)}</div>
        <small>{u.data?.find(y => y.id === x.assigneeId)?.name} · due {x.dueDate}{isOverdue(x) && ' · overdue'}</small>
        <select aria-label={`Status for ${x.title}`} value={x.status} onChange={e => move(x.id, e.target.value)}>{STATUSES.map(o => <option key={o}>{o}</option>)}</select></article>)}</section>)}</div></>
}
