import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

// Pages
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailsPage } from '@/pages/ProjectDetailsPage'
import { TasksPage } from '@/pages/TasksPage'
import { TaskDetailsPage } from '@/pages/TaskDetailsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  // ========== PUBLIC ROUTES ==========
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  // ========== PROTECTED ROUTES ==========
  {
    element: <ProtectedRoute />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },
      {
        path: 'projects',
        element: <ProjectsPage />,
        children: [{ path: ':id', element: <ProjectDetailsPage /> }],
      },
      {
        path: 'tasks',
        element: <TasksPage />,
        children: [{ path: ':taskId', element: <TaskDetailsPage /> }],
      },
    ],
  },
  // ========== 404 ==========
  { path: '*', element: <NotFoundPage /> },
])
