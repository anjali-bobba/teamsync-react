# TeamSync: Team Collaboration & Workflow Management Platform

> **Plan together. Work smarter. Deliver better.**

TeamSync is an industry-style, frontend-only SaaS prototype for managing workspaces, teams, projects, tasks, discussions, deadlines and productivity in one place. It is built with **React** against a **mock REST API**, and every backend interaction sits behind a service layer so the app can later consume a **Java Spring Boot + MySQL** backend without a major rewrite.

- **Live demo:** `<your-netlify-or-vercel-url>`
- **GitHub repository:** `<https://github.com/your-username/teamsync-react>`

---

## Table of Contents

1. [Business Problem](#business-problem)
2. [Features & Modules](#features--modules)
3. [User Roles](#user-roles)
4. [Technology Stack](#technology-stack)
5. [Architecture](#architecture)
6. [Folder Structure](#folder-structure)
7. [Mock API Details](#mock-api-details)
8. [Screenshots](#screenshots)
9. [Local Setup](#local-setup)
10. [Demo Accounts](#demo-accounts)
11. [Business Rules & Validation](#business-rules--validation)
12. [Future Spring Boot + MySQL Roadmap](#future-spring-boot--mysql-roadmap)
13. [Future AI Roadmap](#future-ai-roadmap)
14. [Git Workflow](#git-workflow)
15. [Deployment](#deployment)

---

## Business Problem

- Teams use disconnected tools for tasks, discussions, deadlines and project tracking.
- Managers need visibility into progress, workload and overdue work.
- Team members need one place to see assignments, priorities and deadlines.
- Organizations need role-based access to workspaces, teams and projects.
- The frontend must be architected to evolve into a real full-stack SaaS platform.

TeamSync addresses these by combining workspace, team, project and task management with Kanban boards, notifications, activity timelines and analytics.

---

## Features & Modules

| Module | Highlights |
|---|---|
| **Public** | Landing, Features, About/Help, Demo Access |
| **Authentication** | Login, Registration, Forgot Password UI, demo role flow, session persistence, logout cleanup |
| **Member** | Dashboard, My Tasks, My Projects, Task Details, Notifications, Profile |
| **Workspace** | Workspace list/create, dashboard, members, teams, projects, activity, settings |
| **Project Manager** | Project dashboard and details, Kanban board, task management, members, reports |
| **Workspace Admin** | Workspace management, members, teams, permissions UI, projects, settings |
| **Super Admin** | Platform dashboard, organizations, users, reports, settings |
| **Shared** | 404, loading, error and empty states, confirmation dialogs, search, profile menu |

### Core capabilities

- **Workspaces:** create, list, switch; member add/remove; teams with leads; permissions UI; activity feed.
- **Teams:** create, edit, archive; assign members and lead; workload summary; active projects.
- **Projects:** full CRUD via mock API; status (Planning, Active, On Hold, Completed, Archived); priority (Low to Critical); progress calculated from task state; reports.
- **Tasks:** CRUD, assignment/reassignment, status (Backlog, To Do, In Progress, Review, Done), priority, due dates, labels, optional checklist, comments, activity.
- **Kanban board:** drag-and-drop status changes persisted through the service layer, keyboard-accessible status controls as an alternative, overdue highlighting, filters that don't break dragging, project progress updated after each move.
- **Collaboration:** task comments (edit/delete own), comment counts, activity timelines, attachment UI placeholder.
- **Notifications:** assignment, reassignment, deadline approaching, overdue, comments, membership changes, invitations; read/unread state and filtering.
- **Analytics:** totals, tasks by status and priority, completed vs overdue, upcoming deadlines, workload, project completion %, completion trends and project health, all computed from the mock dataset.
- **Search / filter / sort / pagination:** debounced search, filter chips with reset, sortable and paginated lists across projects, tasks, members and teams.

---

## User Roles

| Role | Responsibilities | Key Capabilities |
|---|---|---|
| Guest | Explore the product | Landing page, product info, demo access |
| Member | Perform assigned work | My tasks, project boards, comments, notifications |
| Team Lead / Project Manager | Coordinate work | Projects, members, task assignment, workflow, reports |
| Workspace Admin | Manage the organization workspace | Members, teams, projects, permissions, settings |
| Super Admin | Platform administration | Organizations, users, reports, platform settings |

Navigation, dashboards and routes are role-specific. Unauthorized navigation is redirected.

---

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | React + JavaScript (JSX) |
| Routing | React Router (nested, dynamic, protected, role-based) |
| State | React state + Context API |
| API client | `<Fetch API / Axios>` |
| Mock backend | `<JSON Server / equivalent>` |
| Storage | localStorage / sessionStorage (session and preferences) |
| Styling | `<CSS Modules / Tailwind / Bootstrap>` |
| Charts | `<Recharts / Chart.js / custom>` |
| Drag & drop | `<@dnd-kit / react-beautiful-dnd / HTML5 DnD>` |
| Version control | Git + GitHub |
| Deployment | `<Netlify / Vercel>` |
| Future backend | Java Spring Boot + REST + JPA/Hibernate |
| Future database | MySQL |

---

## Architecture

```
React Pages & Components
        ↓
React Router  ·  Context / Shared State  ·  Custom Hooks
        ↓
Validation & Utilities
        ↓
Service / API Layer   ← the only place that talks to the backend
        ↓
Mock REST API (JSON Server)  ·  localStorage / sessionStorage
```

**Future:**
`React → REST API → Spring Boot Controller → Service → Repository/JPA → MySQL`

**Optional AI:**
`React → Spring Boot AI Service → AI provider → structured response → React`

### Design principles

- **No API calls inside components.** Components call service functions (`taskService.updateTaskStatus(id, status)`), never `fetch` directly or the mock data shape.
- **Single API client.** The base URL lives in one config value, so switching to Spring Boot is an environment change.
- **Context for cross-cutting state:** auth, current workspace, theme, notifications.
- **Custom hooks** (`useAuth`, `useFetch`, `useDebounce`, `useLocalStorage`) encapsulate reusable logic.
- **Reusable UI kit:** Modal, Table, Card, Badge, Button, Input, Select, Pagination, plus loading/error/empty states.
- **Lazy loading** of role-specific pages for code splitting.

---

## Folder Structure

```
src/
├── assets/
├── components/
│   ├── common/          # Button, Input, Select, Modal, Table, Badge, Pagination, states
│   ├── layout/          # Sidebar, Navbar, ProfileMenu, layouts
│   ├── tasks/
│   ├── projects/
│   ├── teams/
│   ├── workspaces/
│   ├── comments/
│   └── notifications/
├── pages/
│   ├── auth/
│   ├── member/
│   ├── project-manager/
│   ├── workspace-admin/
│   └── super-admin/
├── routes/              # AppRoutes, ProtectedRoute, RoleRoute
├── context/             # AuthContext, WorkspaceContext, ThemeContext, NotificationContext
├── hooks/               # useAuth, useFetch, useDebounce, useLocalStorage
├── services/
│   ├── api/             # shared client (base URL, error handling)
│   ├── authService.js
│   ├── workspaceService.js
│   ├── teamService.js
│   ├── projectService.js
│   ├── taskService.js
│   ├── commentService.js
│   ├── activityService.js
│   ├── notificationService.js
│   └── analyticsService.js
├── utils/               # validators, date helpers, progress/health calculators
├── data/                # mock dataset (db.json source)
├── App.jsx
└── main.jsx
```

---

## Mock API Details

The mock API runs with `<JSON Server>` on `http://localhost:<port>`. Endpoint names mirror the planned Spring Boot controllers.

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| Workspaces | `GET /workspaces`, `GET /workspaces/:id`, `POST /workspaces`, `PUT /workspaces/:id` |
| Members | `GET /members`, `POST /members`, `PATCH /members/:id` |
| Teams | `GET /teams`, `GET /teams/:id`, `POST /teams`, `PUT /teams/:id` |
| Projects | `GET /projects`, `GET /projects/:id`, `POST /projects`, `PUT /projects/:id` |
| Tasks | `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PATCH /tasks/:id` |
| Comments | `GET /tasks/:id/comments`, `POST /tasks/:id/comments`, `PATCH /comments/:id` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` |
| Activity | `GET /projects/:id/activity`, `GET /tasks/:id/activity` |

> Update this table to match your actual routes. Mock data is realistic and fictional. No real passwords or sensitive data are stored.

---

## Screenshots

| Screen | Preview |
|---|---|
| Landing page | `![Landing](docs/screenshots/landing.png)` |
| Member dashboard | `![Member Dashboard](docs/screenshots/member-dashboard.png)` |
| Kanban board | `![Kanban](docs/screenshots/kanban.png)` |
| Task details | `![Task Details](docs/screenshots/task-details.png)` |
| Project dashboard | `![Project Dashboard](docs/screenshots/project-dashboard.png)` |
| Analytics / reports | `![Reports](docs/screenshots/reports.png)` |
| Workspace admin | `![Admin](docs/screenshots/admin.png)` |
| Super admin | `![Super Admin](docs/screenshots/super-admin.png)` |
| Mobile view | `![Mobile](docs/screenshots/mobile.png)` |

---

## Local Setup

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Clone
git clone <https://github.com/anjali-bobba/teamsync-react.git>
cd teamsync-react

# 2. Install dependencies
npm install

# 3. Configure environment (no secrets; only the API base URL)
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3001

# 4. Start the mock API (terminal 1)
npm run api

# 5. Start the app (terminal 2)
npm run dev
```

Open `http://localhost:5173`.

> Adjust the scripts and ports to match your `package.json`. Never commit `.env`, only `.env.example`.

---

## Demo Accounts

Demo credentials are fictional and for evaluation only.

| Role | Email | Password |
|---|---|---|
| Member | `member@teamsync.demo` | `<demo123>` |
| Project Manager | `pm@teamsync.demo` | `<demo123>` |
| Workspace Admin | `admin@teamsync.demo` | `<demo123>` |
| Super Admin | `super@teamsync.demo` | `<demo123>` |

A **Demo Access** button on the landing page also lets you enter as any role in one click.

---

## Business Rules & Validation

- Task title and project name are required; invalid due dates are rejected.
- Completed tasks display completion information; overdue tasks are visually distinct.
- Archived projects do not accept new tasks unless restored.
- Administrative controls are visible only to permitted roles.
- Removing a team member surfaces their assigned work for reassignment.
- Duplicate workspace/project/member relationships are prevented.
- Mock API failures and unknown IDs show clear error states.
- Forms show specific validation messages instead of generic errors.

---

## Future Spring Boot + MySQL Roadmap

| Stage | Technology | Outcome |
|---|---|---|
| 1 | React + Mock REST API | Frontend SaaS prototype *(this repo)* |
| 2 | Spring Boot REST API | Real backend services |
| 3 | Spring Data JPA + MySQL | Persistent workspace/project/task data |
| 4 | Spring Security + JWT | Real authentication and authorization |
| 5 | File/Cloud Storage | Real attachments and profile assets |
| 6 | AI Integration | Planning, summaries, workload and project intelligence |
| 7 | Production Hardening | Testing, logging, monitoring, security, scalability |

### Service-to-backend mapping

| Frontend service | Backend responsibility |
|---|---|
| `authService` | Spring Security authentication and authorization |
| `workspaceService` | Workspace CRUD and membership |
| `teamService` | Team CRUD and membership |
| `projectService` | Project CRUD, members, analytics |
| `taskService` | Task CRUD, assignment, status, filtering |
| `commentService` | Comments and collaboration data |
| `activityService` | Audit / activity timeline |
| `notificationService` | Notifications and read/unread state |
| `analyticsService` | Server-side aggregation for large datasets |

### Planned MySQL entities

`User`, `Workspace`, `WorkspaceMember`, `Team`, `TeamMember`, `Project`, `ProjectMember`, `Task`, `TaskLabel`, `ChecklistItem`, `Comment`, `Activity`, `Notification`.

Key relationships: Workspace → Members/Teams/Projects; Team → Members/Projects; Project → Members/Tasks; Task → Assignee/Comments/Checklist/Activity; User → Notifications.

**Migration plan:** replace the base URL with the Spring Boot API, swap simulated login for JWT-based auth (access token plus refresh), and move filtering, pagination and analytics aggregation server-side. Service method signatures stay the same.

---

## Future AI Roadmap

All AI calls will go **through Spring Boot** so provider keys stay server-side and never reach the browser.

- **Task breakdown:** turn a project goal into suggested tasks and subtasks.
- **Sprint/work planner:** group tasks by priority, deadlines and capacity.
- **Project summary & stand-up assistant:** summarize progress, blockers and risks.
- **Priority assistant:** recommend priority from deadlines and dependencies.
- **Workload insights & risk detection:** flag overloaded members and projects likely to miss deadlines.
- **Meeting-to-tasks:** convert notes into structured action items.
- **Collaboration assistant:** answer authorized project questions from project/task data.

AI output **assists** project managers; it does not automatically make sensitive employment or organizational decisions.

---

## Git Workflow

- Feature branches (`feature/kanban-board`, `feature/auth-rbac`) merged into `main`.
- Meaningful, incremental commits throughout development (setup → layout/routing → auth → workspaces → teams → projects → tasks → Kanban → search/filter → comments/activity → notifications → analytics → admin → states → responsive/a11y → testing → deployment/README).
- `node_modules`, `.env` and secrets are excluded via `.gitignore`.

---

## Deployment

Deployed on `<Netlify / Vercel>`.

- SPA fallback configured so client-side routes work after refresh (`public/_redirects` for Netlify or `vercel.json` rewrites).
- Mock API/data verified after deployment.
- Layouts tested on desktop, tablet and mobile.

---

## License

For educational/assessment purposes.
#   t e a m s y n c - r e a c t  
 