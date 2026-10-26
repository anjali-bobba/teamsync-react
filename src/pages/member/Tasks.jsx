import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDebounce, useFetch } from '../../hooks/index.js'
import { taskService } from '../../services/taskService.js'
import { projectService } from '../../services/projectService.js'
import { authService } from '../../services/authService.js'
import { Loading, ErrorBox, Empty, Badge, Field, Pagination } from '../../components/common/ui.jsx'
import { STATUSES, PRIORITIES, isOverdue, validateTask } from '../../utils/index.js'
const SIZE = 6
export default function Tasks() {
  const { user } = useAuth()
  const [q, setQ] = useState(''), [status, setStatus] = useState(''), [priority, setPriority] = useState(''), [sort, setSort] = useState('dueDate'), [mine, setMine] = useState(user.role === 'member'), [page, setPage] = useState(1), [show, setShow] = useState(false)
  const dq = useDebounce(q)
  const t = useFetch(() => taskService.list(), []), p = useFetch(() => projectService.list(), []), u = useFetch(() => authService.listUsers(), [])
  useEffect(() => setPage(1), [dq, status, priority, mine, sort])
  const name = id => u.data?.find(x => x.id === id)?.name || 'Unassigned'
  const rows = useMemo(() => (t.data || []).filter(x => (!mine || x.assigneeId === user.id) && (!status || x.status === status) && (!priority || x.priority === priority)
    && (!dq || [x.title, x.description, ...x.labels, name(x.assigneeId)].join(' ').toLowerCase().includes(dq.toLowerCase())))
    .sort((a, b) => sort === 'priority' ? PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority) : sort === 'updated' ? b.updatedAt.localeCompare(a.updatedAt) : a.dueDate.localeCompare(b.dueDate)),
  [t.data, u.data, dq, status, priority, sort, mine]) // eslint-disable-line
  const chips = [dq && ['Search: ' + dq, () => setQ('')], status && ['Status: ' + status, () => setStatus('')], priority && ['Priority: ' + priority, () => setPriority('')], mine && ['Assigned to me', () => setMine(false)]].filter(Boolean)
  if (t.loading || p.loading) return <Loading />
  if (t.error || p.error) return <ErrorBox error={t.error || p.error} onRetry={() => { t.reload(); p.reload() }} />
  const pages = Math.max(1, Math.ceil(rows.length / SIZE)), view = rows.slice((page - 1) * SIZE, page * SIZE)
  return <><div className="between"><h1>Tasks</h1><button className="btn primary" onClick={() => setShow(!show)}>{show ? 'Close form' : 'New task'}</button></div>
    {show && <TaskForm projects={p.data} users={u.data || []} me={user} onDone={() => { setShow(false); t.reload() }} />}
    <div className="filters">
      <input aria-label="Search tasks" placeholder="Search title, label or assignee" value={q} onChange={e => setQ(e.target.value)} />
      <select aria-label="Status" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      <select aria-label="Priority" value={priority} onChange={e => setPriority(e.target.value)}><option value="">All priorities</option>{PRIORITIES.map(s => <option key={s}>{s}</option>)}</select>
      <select aria-label="Sort" value={sort} onChange={e => setSort(e.target.value)}><option value="dueDate">Due date</option><option value="priority">Priority</option><option value="updated">Recently updated</option></select>
      <label className="chk"><input type="checkbox" checked={mine} onChange={e => setMine(e.target.checked)} /> Mine only</label></div>
    {chips.length > 0 && <div className="chips">{chips.map(([l, fn]) => <button key={l} className="chip" onClick={fn} aria-label={`Remove filter ${l}`}>{l} ×</button>)}<button className="btn ghost" onClick={() => { setQ(''); setStatus(''); setPriority(''); setMine(false) }}>Clear all</button></div>}
    {view.length === 0 ? <Empty title="No tasks match" hint="Try clearing a filter or create a new task." /> :
      <div className="tablewrap"><table><thead><tr><th>Task</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead><tbody>
        {view.map(x => <tr key={x.id} className={isOverdue(x) ? 'overdue' : ''}><td>{x.title} {x.labels.map(l => <small key={l} className="label">{l}</small>)}</td><td>{p.data.find(y => y.id === x.projectId)?.name}</td><td>{name(x.assigneeId)}</td>
          <td><Badge kind={x.priority}>{x.priority}</Badge></td><td>{x.status}{x.completedAt && <small> (done {x.completedAt})</small>}</td><td>{x.dueDate}{isOverdue(x) && <Badge kind="Critical">Overdue</Badge>}</td></tr>)}</tbody></table></div>}
    <Pagination page={page} pages={pages} onPage={setPage} /></>
}
function TaskForm({ projects, users, me, onDone }) {
  const [f, setF] = useState({ title: '', projectId: '', assigneeId: me.id, priority: 'Medium', dueDate: '' }), [err, setErr] = useState({}), [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = async e => {
    e.preventDefault(); const v = validateTask(f); setErr(v); if (Object.keys(v).length) return
    setBusy(true); try { await taskService.create({ ...f, title: f.title.trim() }); onDone() } catch (x) { setErr({ form: x.message }); setBusy(false) }
  }
  return <form className="card formgrid" onSubmit={submit} noValidate>
    <Field label="Title" error={err.title}><input value={f.title} onChange={set('title')} /></Field>
    <Field label="Project" error={err.projectId}><select value={f.projectId} onChange={set('projectId')}><option value="">Choose…</option>{projects.map(x => <option key={x.id} value={x.id}>{x.name}{x.status === 'Archived' ? ' (archived)' : ''}</option>)}</select></Field>
    <Field label="Assignee"><select value={f.assigneeId} onChange={set('assigneeId')}>{users.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
    <Field label="Priority"><select value={f.priority} onChange={set('priority')}>{PRIORITIES.map(x => <option key={x}>{x}</option>)}</select></Field>
    <Field label="Due date" error={err.dueDate}><input type="date" value={f.dueDate} onChange={set('dueDate')} /></Field>
    {err.form && <p className="errtxt" role="alert">{err.form}</p>}
    <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Create task'}</button></form>
}
