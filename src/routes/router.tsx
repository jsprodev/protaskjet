import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

// Pages
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { CreateProjectPage } from '@/pages/CreateProjectPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailsPage } from '@/pages/ProjectDetailsPage'

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
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/projects/new', element: <CreateProjectPage /> },
      { path: '/projects', element: <ProjectsPage />, children: [{ path: ':id', element: <ProjectDetailsPage /> }] },
      // { path: '/projects/:id', element: <ProjectDetailsPage /> },
    ],
  },

  // ========== 404 ==========
  { path: '*', element: <NotFoundPage /> },
])
