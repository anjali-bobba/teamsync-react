// Realistic fictional demo data. Dates are relative to today so overdue/upcoming logic stays meaningful.
const d = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
const pw = 'demo123' // demo only; a real backend stores password hashes
const users = [
  ['u1','Aisha Rao','member@teamsync.demo','member'],['u2','Rahul Mehta','pm@teamsync.demo','manager'],
  ['u3','Sara Khan','admin@teamsync.demo','admin'],['u4','Dev Patel','super@teamsync.demo','super'],
  ['u5','Nina Joshi','nina@teamsync.demo','member'],['u6','Karan Shah','karan@teamsync.demo','member'],
].map(([id, name, email, role]) => ({ id, name, email, role, password: pw, status: 'Active' }))
const projects = [
  { id:'p1', name:'Website Redesign', team:'Design', managerId:'u2', status:'Active', priority:'High', dueDate:d(20) },
  { id:'p2', name:'Mobile App', team:'Engineering', managerId:'u2', status:'Active', priority:'Critical', dueDate:d(35) },
  { id:'p3', name:'Marketing Campaign', team:'Marketing', managerId:'u2', status:'Planning', priority:'Medium', dueDate:d(50) },
]
const T = [
  ['Design wireframes','p1','u1','Done','High',-6,'Frontend'],['Build homepage','p1','u5','In Progress','High',3,'Frontend'],
  ['Write blog content','p1','u6','To Do','Low',9,'Documentation'],['Fix navigation issue','p1','u1','Review','Medium',-1,'Bug'],
  ['Set up CI pipeline','p2','u5','Done','Medium',-4,'Backend'],['Develop login API','p2','u6','In Progress','Critical',2,'Backend'],
  ['Push notifications','p2','u1','To Do','High',12,'Feature'],['Offline sync spike','p2','u5','Backlog','Medium',25,'Feature'],
  ['Checkout flow tests','p2','u1','Review','High',-2,'Bug'],['Brand asset pack','p3','u6','In Progress','Medium',5,'Documentation'],
  ['Competitor research','p3','u1','Done','Low',-8,'Feature'],['Email templates','p3','u5','To Do','Medium',7,'Frontend'],
  ['Analytics setup','p3','u6','Backlog','Low',30,'Backend'],['Accessibility audit','p1','u1','To Do','High',4,'Bug'],
].map(([title, projectId, assigneeId, status, priority, due, label], i) => ({
  id:'t'+(i+1), title, projectId, assigneeId, status, priority, dueDate:d(due), labels:[label],
  description:'', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
  completedAt: status === 'Done' ? d(-1) : null }))
export const seed = { users, projects, tasks: T, activity: [] }
