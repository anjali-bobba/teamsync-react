import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, Link } from 'react-router-dom'
import Protected from './routes/Guards.jsx'
import Layout from './components/layout/Layout.jsx'
import Login from './pages/auth/Login.jsx'
import { Loading } from './components/common/ui.jsx'
const Dashboard = lazy(() => import('./pages/member/Dashboard.jsx'))
const Tasks = lazy(() => import('./pages/member/Tasks.jsx'))
const Projects = lazy(() => import('./pages/project-manager/Projects.jsx'))
const Kanban = lazy(() => import('./pages/project-manager/Kanban.jsx'))
const Admin = lazy(() => import('./pages/workspace-admin/Admin.jsx'))
const NotFound = () => <div className="state"><b>Page not found</b><p><Link to="/login">Back to TeamSync</Link></p></div>
export default function App() {
  return <Suspense fallback={<Loading />}><Routes>
    <Route path="/" element={<Navigate to="/login" replace />} /><Route path="/login" element={<Login />} />
    <Route element={<Protected />}><Route path="/app" element={<Layout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} /><Route path="tasks" element={<Tasks />} /><Route path="projects" element={<Projects />} />
      <Route element={<Protected roles={['manager', 'admin']} />}><Route path="board" element={<Kanban />} /></Route>
      <Route element={<Protected roles={['admin', 'super']} />}><Route path="admin" element={<Admin />} /></Route>
    </Route></Route>
    <Route path="*" element={<NotFound />} /></Routes></Suspense>
}
