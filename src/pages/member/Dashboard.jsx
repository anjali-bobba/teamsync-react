import { useAuth } from '../../context/AuthContext.jsx'
import { useFetch } from '../../hooks/index.js'
import { taskService } from '../../services/taskService.js'
import { projectService } from '../../services/projectService.js'
import { Loading, ErrorBox, Empty, Badge } from '../../components/common/ui.jsx'
import { STATUSES, countBy, isOverdue, progress, daysLeft, health } from '../../utils/index.js'
const Bar = ({ v, max, label }) => <div className="barrow"><span>{label}</span><div className="bar"><i style={{ width: `${max ? v / max * 100 : 0}%` }} /></div><b>{v}</b></div>
export default function Dashboard() {
  const { user } = useAuth()
  const t = useFetch(() => taskService.list(), []), p = useFetch(() => projectService.list(), []), a = useFetch(() => taskService.activity(), [])
  if (t.loading || p.loading) return <Loading />
  if (t.error || p.error) return <ErrorBox error={t.error || p.error} onRetry={() => { t.reload(); p.reload() }} />
  const tasks = t.data, projects = p.data, byStatus = countBy(tasks, 'status'), mine = tasks.filter(x => x.assigneeId === user.id && x.status !== 'Done')
  const upcoming = tasks.filter(x => x.status !== 'Done' && daysLeft(x.dueDate) >= 0 && daysLeft(x.dueDate) <= 7).sort((x, y) => x.dueDate.localeCompare(y.dueDate))
  const stats = [['Projects', projects.length], ['Active projects', projects.filter(x => x.status === 'Active').length], ['Completed tasks', byStatus.Done || 0], ['Overdue tasks', tasks.filter(isOverdue).length], ['My open tasks', mine.length]]
  return <><h1>Good day, {user.name.split(' ')[0]}</h1>
    <div className="stats">{stats.map(([l, v]) => <div key={l} className={`card stat ${l === 'Overdue tasks' && v ? 'warn' : ''}`}><b>{v}</b><span>{l}</span></div>)}</div>
    <div className="cols">
      <section className="card"><h3>Tasks by status</h3>{STATUSES.map(s => <Bar key={s} label={s} v={byStatus[s] || 0} max={tasks.length} />)}</section>
      <section className="card"><h3>Project progress</h3>{projects.map(pr => { const pt = tasks.filter(x => x.projectId === pr.id); return <div key={pr.id}><div className="between"><span>{pr.name}</span><span><Badge kind={health(pt).replace(' ', '')}>{health(pt)}</Badge> {progress(pt)}%</span></div><div className="bar"><i style={{ width: progress(pt) + '%' }} /></div></div> })}</section>
      <section className="card"><h3>Upcoming deadlines (7 days)</h3>{upcoming.length ? <ul className="list">{upcoming.map(x => <li key={x.id}><span>{x.title}</span><small>{x.dueDate}</small></li>)}</ul> : <Empty title="Nothing due this week" hint="New deadlines will appear here." />}</section>
      <section className="card"><h3>Recent activity</h3>{a.data?.length ? <ul className="list">{[...a.data].reverse().slice(0, 6).map(x => <li key={x.id}>{x.actor} {x.action}</li>)}</ul> : <Empty title="No activity yet" hint="Move a task on the board to see it here." />}</section>
    </div></>
}
