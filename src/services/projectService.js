import { api } from './api/client.js'
export const projectService = {
  list: () => api.get('/projects'),
  get: id => api.get('/projects/' + id),
  create: p => api.post('/projects', p),
  update: (id, patch) => api.patch('/projects/' + id, patch),
}
