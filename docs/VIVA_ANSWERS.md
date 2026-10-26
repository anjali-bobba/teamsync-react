# TeamSync: Viva Answers

> Answers are written against the architecture in the project brief. Adjust any detail (library names, file names, hook names) to match what you actually built, and be ready to open the code and show it.

---

## 1. Why did you choose React for TeamSync?

TeamSync is a highly interactive app with many repeated UI pieces (task cards, tables, badges, modals) and a lot of state that changes together (a task moves on the Kanban board, so the card, column counts, project progress and activity feed all update). React's component model lets me build those pieces once and reuse them. Hooks and Context handle state cleanly, React Router handles nested and role-based routes, and the ecosystem (charts, drag-and-drop) is mature. It's also a good fit for a frontend that will later talk to a REST backend.

## 2. Explain your component and folder architecture.

I separate by responsibility:

- `components/common`: generic UI kit (Button, Input, Select, Modal, Table, Badge, Pagination, loading/error/empty states).
- `components/<domain>`: feature components (tasks, projects, teams, workspaces, comments, notifications).
- `components/layout`: sidebar, navbar, profile menu.
- `pages/<role>`: route-level screens for member, project manager, workspace admin and super admin.
- `routes`: route config, `ProtectedRoute`, `RoleRoute`.
- `context`: shared state (auth, workspace, theme, notifications).
- `hooks`: reusable logic (`useAuth`, `useFetch`, `useDebounce`, `useLocalStorage`).
- `services`: the API layer, one file per resource.
- `utils` and `data`: validators, date and progress calculators, mock dataset.

Pages compose components, components receive data via props or hooks, and only services touch the network.

## 3. Why should API calls be isolated in service files?

- **Replaceability:** only the service layer knows URLs and response shapes, so switching from the mock API to Spring Boot changes one place, not dozens of components.
- **Reusability:** the same `taskService.getTasks(filters)` serves the task list, Kanban board and dashboard.
- **Testability:** I can mock a service easily in tests.
- **Consistency:** error handling, headers (later JWT) and base URL live in one shared client.
- **Cleaner components:** they focus on rendering and interaction, not HTTP details.

## 4. Where did you use Context API and why?

For state many distant components need, where prop drilling would be painful:

- **AuthContext:** current user, role, login/logout. Used by routes, navbar and role-specific UI.
- **WorkspaceContext:** the currently selected workspace, used across pages.
- **ThemeContext:** dark/light mode.
- **NotificationContext:** unread count and notification list shown in the navbar and notification page.

Context is not used for everything. Frequently changing, page-specific data stays local.

## 5. What is the difference between local state and shared state in your project?

**Local state** belongs to one component or a small subtree: a modal's open/closed flag, form field values, the current page number, a search box's text. I use `useState` for it.

**Shared state** is needed by many unrelated components: the logged-in user, selected workspace, theme, notifications. That lives in Context. The rule I followed: keep state as local as possible and lift it up to Context only when multiple distant parts of the app need it.

## 6. How do protected and role-based routes work?

- `ProtectedRoute` reads auth state from `AuthContext`. If there's no session, it redirects to `/login` (preserving the intended destination).
- `RoleRoute` (or an `allowedRoles` prop) checks `user.role` against the roles allowed for that route group. If the role isn't allowed, it redirects to the user's own dashboard or an "unauthorized" page.
- Routes are nested by role (`/member/*`, `/pm/*`, `/admin/*`, `/super-admin/*`), each wrapped in these guards, so typing a URL manually doesn't bypass access.
- The sidebar is also built from the role, so users only see links they're allowed to use.

Route guards are a UX layer. Real security must be enforced on the backend.

## 7. How does your Kanban board update task status?

1. Tasks are fetched through `taskService` and grouped into columns by status (Backlog, To Do, In Progress, Review, Done).
2. When a card is dropped on another column (or a status control is used), the handler calls `taskService.updateTaskStatus(id, newStatus)`, which sends a `PATCH /tasks/:id`.
3. I update the UI optimistically so the card moves immediately, then reconcile with the server response. On failure I roll back and show an error message.
4. After success, the project's progress is recalculated and an activity entry is recorded.

## 8. How would you implement drag-and-drop accessibly?

Drag-and-drop is pointer-centric, so I provide equivalents:

- A **status dropdown or "Move to…" buttons** on every card, fully keyboard operable and available to screen readers.
- If using a library like `@dnd-kit`, enable its **keyboard sensor** (space to pick up, arrows to move, space to drop) and **live-region announcements** ("Task moved to Review").
- Visible focus styles, proper roles and labels, and sufficient colour contrast (status isn't conveyed by colour alone).

Drag is an enhancement, never the only way to change status.

## 9. How do you calculate project completion percentage?

```
progress = (number of tasks with status "Done" / total tasks) × 100
```

I exclude archived/cancelled tasks if applicable, and handle zero tasks as 0% to avoid division by zero. The calculation lives in a utility function, so it works for any project's task list and gets recalculated whenever a task's status changes. A more advanced version could weight tasks by priority or estimate.

## 10. How do search, filtering, sorting and pagination work?

- **Search** text is debounced, then matched against title, description, assignee and labels (case-insensitive).
- **Filters** (status, priority, assignee, project, due date, label) are held in a filter state object. Active filters appear as chips with a reset option.
- **Sorting** applies after filtering (due date, priority, recently updated, created date).
- **Pagination** slices the sorted result by page and page size, and resets to page 1 when search or filters change.
- With the mock API, this can run client-side or through query params; with Spring Boot it moves server-side (`?status=...&sort=...&page=...&size=...`), so the service signature stays the same.

## 11. Why is debouncing useful for workspace/task search?

Without debouncing, every keystroke triggers filtering or an API request. Debouncing (`useDebounce`) waits until the user pauses typing (for example 300-500 ms) before applying the query. That reduces unnecessary requests and re-renders, avoids flickering results and race conditions, and keeps the UI responsive, which matters more with large datasets and a real backend.

## 12. How do you handle loading, error and empty states?

Every async view has three explicit states, handled by reusable components and the `useFetch` hook (which returns `data`, `loading`, `error`):

- **Loading:** spinner or skeleton.
- **Error:** clear message with a retry action (covers API failures and unknown IDs).
- **Empty:** friendly message with a call to action ("No tasks yet, create one").

Rendering order is loading → error → empty → data, so users never see a blank screen or a misleading state.

## 13. How do comments and activity differ?

- **Comments** are user-authored discussion: content, author, timestamp, editable or deletable by their own author.
- **Activity** is a system-generated audit trail: "Sarah moved Task X to Review", "Task reassigned to Ravi", "Project status changed". Users don't write or edit it.

In the data model they're separate entities (`Comment` vs `Activity`) because they have different lifecycles and purposes.

## 14. How would you prevent unauthorized users from changing project data?

On the frontend: hide admin/manager controls by role, guard routes, and disable actions the role can't do. That improves UX but is **not security**, since users can bypass the UI.

Real protection needs the backend: Spring Security with JWT authentication, role and permission checks on every endpoint (`@PreAuthorize`), verifying the user belongs to the workspace or project, input validation, and audit logging. The server never trusts the client's claimed role.

## 15. How would you replace the mock API with Spring Boot?

Because components only call services:

1. Change the API base URL (via environment variable).
2. Align endpoint paths and response DTOs. Where they differ, adapt inside the service (a mapper function), not in components.
3. Add JWT handling in the shared API client (Authorization header, 401 handling, refresh).
4. Move filtering, sorting, pagination and analytics to server-side query parameters.
5. Test each service against the real API.

No page or component rewrites are needed.

## 16. How would your React data map to MySQL tables?

Each JSON resource becomes a table, and nested or related data becomes foreign keys:

- `users`, `workspaces` (`owner_id`), `workspace_members` (`workspace_id`, `user_id`, `role`)
- `teams` (`workspace_id`, `lead_user_id`), `team_members`
- `projects` (`workspace_id`, `team_id`, `manager_id`), `project_members`
- `tasks` (`project_id`, `assignee_id`), `task_labels`, `checklist_items`
- `comments` (`task_id`, `author_id`), `activities`, `notifications` (`user_id`)

Many-to-many relationships (users to teams and projects) use join tables, with indexes on foreign keys and on common filters (`status`, `due_date`, `assignee_id`).

## 17. How would Spring Security/JWT change authentication?

Instead of simulated login, `POST /auth/login` validates credentials (BCrypt-hashed passwords) and returns a signed **JWT** (plus a refresh token). The React auth service stores it and the API client attaches `Authorization: Bearer <token>` to every request. Spring Security filters validate the token and enforce role-based access. Token expiry triggers refresh or a redirect to login. Prefer an httpOnly cookie or short-lived memory-held access token over long-lived localStorage tokens to reduce XSS risk. The frontend's `AuthContext` interface stays the same.

## 18. Where would AI fit into TeamSync?

As assistive features behind Spring Boot: breaking a goal into tasks, summarizing project status, stand-up summaries, meeting notes to tasks, workload insights, priority suggestions and deadline-risk detection. The UI would show suggestions the project manager can accept, edit or reject. AI does not make sensitive employment decisions on its own.

## 19. Why should AI provider keys not be exposed in React?

Everything in a React bundle is visible to anyone through browser dev tools or the network tab. An exposed key can be stolen and abused, causing cost, data leakage and policy violations. The key must live server-side (Spring Boot environment or a secrets manager). The backend also enforces authorization (so the AI only sees data the user may access), rate limits, validates and logs requests, and returns a structured response to React.

## 20. How would you scale TeamSync for thousands of users and millions of tasks?

- **Backend:** server-side pagination, filtering and aggregation (`analyticsService`), with DB indexes and query tuning.
- **Caching:** Redis for hot data, HTTP caching, and CDN for static assets.
- **Frontend:** code splitting and lazy loading, virtualized lists for long task lists, debounced search, and optimistic UI.
- **Real-time:** WebSockets or SSE for notifications and board updates instead of polling.
- **Infrastructure:** stateless Spring Boot instances behind a load balancer, read replicas, async jobs (queues) for notifications and AI work, and monitoring and logging.
- **Data:** archive old activity and notifications, and partition large tables if needed.

---

## Quick Tips for the Viva

- **Demo flow:** log in as each role → show a protected route redirect → create a task → drag it on the Kanban board → show progress and activity update → show the notification.
- Be ready to open `services/taskService.js` and show that components never call `fetch` directly.
- Be honest about what's mocked and what a real backend would change.
