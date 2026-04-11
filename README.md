# 🐛 BugTrackr — Bug & Issue Tracker

## 🌐 Live Demo

🔗 **Frontend:** [https://bugs-issue-tracker-frontend.vercel.app](https://bugs-issue-tracker-frontend.vercel.app)

🔗 **Backend API:** [https://bugs-issue-tracker-backend.onrender.com](https://bugs-issue-tracker-backend.onrender.com)

> ⚠️ **Note:** The backend is hosted on Render's free tier. The first request after inactivity may take **30–50 seconds** to respond (cold start). Please wait a moment if the login seems slow.

### 🔑 Demo Credentials

Try the app instantly with these pre-seeded accounts:

| Role | Email | Password |
|------|-------|----------|
| 👔 Manager | tanay@test.com | 123456 |
| 🧪 Tester | aarush@test.com | 123456 |
| 🧪 Tester | aman_goswami@example.com | 123456 |
| 💻 Developer | bharat@test.com | 123456 |

---

## 🎯 Why I Built This

As a fresher actively seeking opportunities in product-based companies and startups, I wanted to build something **beyond a todo app** — a project that demonstrates real-world engineering decisions.

I chose a **Bug & Issue Tracker** because:

- It mirrors tools used in actual software teams (Jira, Linear, GitHub Issues)
- It requires **non-trivial architecture** — role-based access, nested resources, activity logging
- It showcases both **backend design skills** (REST APIs, middleware, auth) and **frontend skills** (state management, protected routing, role-conditional UI)
- Recruiters and interviewers immediately understand the domain — no explanation needed

This project pushed me to think like a **product engineer**, not just a coder.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based login and registration
- Role-based access control — **Manager**, **Tester**, **Developer**
- Protected routes — unauthenticated users redirected to login
- Role routes — wrong-role users redirected to dashboard
- Auto-logout on token expiry (401 interceptor)

### 📊 Dashboard
- Overall bug statistics — Total, Open, In Progress, Closed
- Priority breakdown — High, Medium, Low
- Per-project stats with project selector
- Count-up animations on stat cards
- Recent bugs quick view

### 📁 Projects
- Create, edit, delete projects (Manager)
- Add and remove team members (Manager)
- Per-project stats and overview
- Searchable project grid

### 🏃 Sprints
- Full sprint lifecycle — Planned → Active → Completed
- Link bugs to sprints
- Manager-controlled sprint management

### 🐛 Bugs & Issues
- Create bugs with title, description, priority, project, sprint (Tester)
- Filter by status, priority, project
- Assign bugs to developers (Manager)
- Update bug status (Developer)
- Full edit and delete with confirmation dialogs

### 💬 Comments & Activity
- Threaded comments on every bug (all roles)
- Delete own comments (or Manager)
- Auto-generated activity log — tracks every status change and assignment
- Timeline-style activity feed on bug detail page

### 👥 Role-Specific Views
- **Manager** — User management table, assign bugs, full project control
- **Tester** — "Reported by Me" view, bug creation and editing
- **Developer** — Kanban-style "Assigned to Me" board, inline status updates

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database and ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| CORS | Cross-origin request handling |
| dotenv | Environment variable management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + Vite | UI framework and build tool |
| Tailwind CSS v4 | Utility-first styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Framer Motion | Animations and page transitions |
| React Hot Toast | Notification system |
| date-fns | Date formatting utilities |

### Deployment
| Service | Purpose |
|---------|---------|
| Render | Backend hosting (Node.js) |
| Vercel | Frontend hosting |
| MongoDB Atlas | Cloud database |

---

## 🏗️ Project Structure

```
Bugs-Issue-Tracker/
├── BACKEND/
│   ├── src/
│   │   ├── config/         → MongoDB connection
│   │   ├── controllers/    → Business logic (8 controllers)
│   │   ├── middlewares/    → JWT protect + role guard
│   │   ├── models/         → Mongoose schemas (6 models)
│   │   └── routes/         → Express routers (8 route files)
│   └── server.js           → App entry point
│
└── FRONTEND/
    └── src/
        ├── api/            → Axios API layer (9 files)
        ├── context/        → AuthContext (global auth state)
        ├── components/     → Reusable UI (15 components)
        ├── pages/          → Route-level views (12 pages)
        ├── hooks/          → useAuth, useRole
        └── utils/          → Role helpers, date formatters
```

### API Endpoints (30+ routes)

| Resource | Endpoints |
|----------|-----------|
| Auth | POST /register, POST /login, GET /me |
| Users | GET, GET/:id, PUT/:id, DELETE/:id |
| Projects | CRUD + POST/:id/members + DELETE/:id/members/:userId |
| Sprints | Full CRUD |
| Bugs | CRUD + PATCH /status + PATCH /assign + GET /assigned/me + GET /reported/me |
| Comments | GET, POST, DELETE (nested under bugs) |
| Activity | GET (nested under bugs) |
| Dashboard | GET /stats + GET /project/:id |

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/aarush-f7/Bugs-Issue-Tracker.git
cd Bugs-Issue-Tracker
```

### 2. Backend setup
```bash
cd BACKEND
npm install
```

Create a `.env` file in the `BACKEND/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd FRONTEND
npm install
```

Create a `.env` file in the `FRONTEND/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 4. Open the app
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## 📚 What I Learned

Building this project from scratch taught me skills that go far beyond tutorials:

### Backend Engineering
- Designing a **RESTful API** with proper HTTP semantics (GET, POST, PUT, PATCH, DELETE)
- Implementing **JWT authentication** — token generation, verification, and expiry handling
- Building **role-based middleware** — `protect` (auth check) + `roleGuard` (permission check)
- Writing **Mongoose schemas** with relationships, enums, and pre-save hooks (bcrypt hashing)
- Handling **nested resources** — comments and activity logs under bugs using `mergeParams`
- **CORS configuration** for cross-origin requests between separate frontend/backend deployments
- **Error handling** — global error middleware, proper HTTP status codes

### Frontend Engineering
- Managing **global auth state** with React Context API
- Building **protected routes** and **role routes** with React Router v6
- Implementing **Axios interceptors** — auto-attach JWT headers + global 401 logout
- **Optimistic UI updates** for instant user feedback before API confirmation
- **Role-conditional rendering** — showing/hiding buttons and pages based on user role
- Framer Motion for **page transitions**, staggered list animations, modal animations
- Building a **responsive layout** with collapsible sidebar for mobile

### DevOps & Deployment
- Deploying a **Node.js backend** to Render with environment variables
- Deploying a **Vite React app** to Vercel with SPA routing fix (`vercel.json`)
- Managing **environment variables** separately for development and production
- Understanding **monorepo structure** — backend and frontend in one GitHub repository

### Software Engineering Practices
- **MVC architecture** — separating routes, controllers, models cleanly
- **Git workflow** — meaningful commit messages, `.gitignore` for sensitive files
- Writing **reusable components** (Modal, ConfirmDialog, EmptyState, Badges)
- **API design** — consistent response shapes, proper error messages

---

## 👨‍💻 About Me

Hi, I'm **Aarush Rajak** — a frontend-focused full-stack developer and CSE graduate from **Gyan Ganga College of Technology, Jabalpur**.

I'm actively seeking opportunities at product-based companies and startups, particularly in **Bangalore, Pune, and Noida**.

- 🏆 ZTCA Certified (Affiliated with Eduskills & AICTE)
- 💻 Skilled in React.js, Node.js, Express.js, MongoDB, Tailwind CSS
- 🎯 Passionate about building products that solve real problems
- 📫 Open to full-time roles, internships, and freelance projects

[![GitHub](https://img.shields.io/badge/GitHub-aarush--f7-181717?style=flat&logo=github)](https://github.com/aarush-f7)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---


**If you found this project useful, consider giving it a ⭐ — it means a lot!**

Made with ❤️ by Aarush Rajak


