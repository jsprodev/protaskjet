import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailsPage } from '@/pages/ProjectDetailsPage'
import { TasksPage } from '@/pages/TasksPage'
import { TaskDetailsPage } from '@/pages/TaskDetailsPage'
import { UsersPage } from '@/pages/UsersPage'
import { ErrorBoundary, RouteErrorElement } from '@/components/ErrorBoundary'
import { UserDetailsPage } from '@/pages/UserDetailsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  // ========== PUBLIC ROUTES ==========
  {
    element: (
      <ErrorBoundary>
        <PublicRoute />
      </ErrorBoundary>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
    errorElement: <RouteErrorElement />,
  },
  // ========== PROTECTED ROUTES ==========
  {
    element: (
      <ErrorBoundary>
        <ProtectedRoute />
      </ErrorBoundary>
    ),
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
      {
        path: 'users',
        element: <UsersPage />,
        children: [{ path: ':userId', element: <UserDetailsPage /> }],
      },
    ],
    errorElement: <RouteErrorElement />,
  },
  // ========== 404 ==========
  // { path: '*', element: <NotFoundPage /> },
  { path: '*', element: <RouteErrorElement /> },
])
