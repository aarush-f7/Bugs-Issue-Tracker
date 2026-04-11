import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import BugsPage from './pages/BugsPage';
import BugDetailPage from './pages/BugDetailPage';
import AssignedToMePage from './pages/AssignedToMePage';
import ReportedByMePage from './pages/ReportedByMePage';
import UserManagementPage from './pages/UserManagementPage';
import SprintsPage from './pages/SprintsPage';
import ProfilePage from './pages/ProfilePage';

// Shell layout (sidebar + navbar + content)
const AppShell = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — wrapped in AppShell */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell><DashboardPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <AppShell><ProjectsPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <AppShell><ProjectDetailPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/bugs" element={
          <ProtectedRoute>
            <AppShell><BugsPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/bugs/:id" element={
          <ProtectedRoute>
            <AppShell><BugDetailPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/sprints" element={
          <ProtectedRoute>
            <AppShell><SprintsPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <AppShell><ProfilePage /></AppShell>
          </ProtectedRoute>
        } />

        {/* Role-protected routes */}
        <Route path="/assigned-to-me" element={
          <RoleRoute allowedRoles={['Developer']}>
            <AppShell><AssignedToMePage /></AppShell>
          </RoleRoute>
        } />

        <Route path="/reported-by-me" element={
          <RoleRoute allowedRoles={['Tester']}>
            <AppShell><ReportedByMePage /></AppShell>
          </RoleRoute>
        } />

        <Route path="/users" element={
          <RoleRoute allowedRoles={['Manager']}>
            <AppShell><UserManagementPage /></AppShell>
          </RoleRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
