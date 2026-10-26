export const STATUSES = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done']
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
export const today = () => new Date().toISOString().slice(0, 10)
export const isOverdue = t => t.status !== 'Done' && !!t.dueDate && t.dueDate < today()
export const progress = tasks => tasks.length ? Math.round(tasks.filter(t => t.status === 'Done').length / tasks.length * 100) : 0
export const countBy = (arr, k) => arr.reduce((a, x) => ((a[x[k]] = (a[x[k]] || 0) + 1), a), {})
export const daysLeft = d => Math.ceil((new Date(d) - new Date(today())) / 864e5)
export const health = tasks => { const o = tasks.filter(isOverdue).length; return !tasks.length ? 'No data' : o === 0 ? 'Healthy' : o / tasks.length > .25 ? 'At risk' : 'Watch' }
export function validateTask(f) {
  const e = {}
  if (!f.title?.trim()) e.title = 'Enter a task title.'
  if (!f.projectId) e.projectId = 'Choose a project.'
  if (f.dueDate && isNaN(Date.parse(f.dueDate))) e.dueDate = 'Enter a valid due date.'
  return e
}
