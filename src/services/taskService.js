import { api } from './api/client.js'
export const taskService = {
  list: params => api.get('/tasks', params),
  async create(t) {
    const p = await api.get('/projects/' + t.projectId)
    if (p.status === 'Archived') throw new Error('Archived projects do not accept new tasks. Restore the project first.')
    const now = new Date().toISOString()
    return api.post('/tasks', { status: 'To Do', labels: [], description: '', ...t, createdAt: now, updatedAt: now, completedAt: null })
  },
  async updateStatus(id, status, actor) {
    const t = await api.patch('/tasks/' + id, { status, completedAt: status === 'Done' ? new Date().toISOString().slice(0, 10) : null })
    await api.post('/activity', { taskId: id, actor, action: `moved "${t.title}" to ${status}`, createdAt: new Date().toISOString() })
    return t
  },
  activity: () => api.get('/activity'),
}
