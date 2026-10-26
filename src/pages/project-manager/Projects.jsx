import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDebounce, useFetch } from '../../hooks/index.js'
import { projectService } from '../../services/projectService.js'
import { taskService } from '../../services/taskService.js'
import { Loading, ErrorBox, Empty, Badge, Field } from '../../components/common/ui.jsx'
import { progress, PRIORITIES } from '../../utils/index.js'
const PSTATUS = ['Planning', 'Active', 'On Hold', 'Completed', 'Archived']
export default function Projects() {
  const { user } = useAuth(), canEdit = ['manager', 'admin'].includes(user.role)
  const p = useFetch(() => projectService.list(), []), t = useFetch(() => taskService.list(), [])
  const [q, setQ] = useState(''), [st, setSt] = useState(''), [f, setF] = useState({ name: '', status: 'Planning', priority: 'Medium' }), [err, setErr] = useState('')
  const dq = useDebounce(q)
  const rows = useMemo(() => (p.data || []).filter(x => (!st || x.status === st) && (!dq || [x.name, x.team].join(' ').toLowerCase().includes(dq.toLowerCase()))), [p.data, dq, st])
  if (p.loading || t.loading) return <Loading />
  if (p.error || t.error) return <ErrorBox error={p.error || t.error} onRetry={() => { p.reload(); t.reload() }} />
  const create = async e => {
    e.preventDefault(); if (!f.name.trim()) return setErr('Enter a project name.')
    if (p.data.some(x => x.name.toLowerCase() === f.name.trim().toLowerCase())) return setErr('A project with this name already exists.')
    setErr(''); await projectService.create({ ...f, name: f.name.trim(), team: 'General', managerId: user.id, dueDate: '' }); setF({ ...f, name: '' }); p.reload()
  }
  const toggleArchive = async x => { if (x.status === 'Archived' || window.confirm(`Archive "${x.name}"? It will stop accepting new tasks.`)) { await projectService.update(x.id, { status: x.status === 'Archived' ? 'Active' : 'Archived' }); p.reload() } }
  return <><h1>Projects</h1>
    {canEdit && <form className="card formgrid" onSubmit={create} noValidate>
      <Field label="Project name" error={err}><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="Status"><select value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>{PSTATUS.map(x => <option key={x}>{x}</option>)}</select></Field>
      <Field label="Priority"><select value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })}>{PRIORITIES.map(x => <option key={x}>{x}</option>)}</select></Field>
      <button className="btn primary">Create project</button></form>}
    <div className="filters"><input aria-label="Search projects" placeholder="Search by name or team" value={q} onChange={e => setQ(e.target.value)} />
      <select aria-label="Status" value={st} onChange={e => setSt(e.target.value)}><option value="">All statuses</option>{PSTATUS.map(x => <option key={x}>{x}</option>)}</select></div>
    {rows.length === 0 ? <Empty title="No projects found" hint="Adjust your search or create a project." /> :
      <div className="cols">{rows.map(x => { const pt = t.data.filter(y => y.projectId === x.id); return <article key={x.id} className="card"><div className="between"><h3>{x.name}</h3><Badge kind={x.priority}>{x.priority}</Badge></div>
        <p className="muted">{x.team} · {x.status}</p><div className="bar"><i style={{ width: progress(pt) + '%' }} /></div><p>{progress(pt)}% of {pt.length} tasks done</p>
        {canEdit && <button className="btn ghost" onClick={() => toggleArchive(x)}>{x.status === 'Archived' ? 'Restore' : 'Archive'}</button>}</article> })}</div>}</>
}
