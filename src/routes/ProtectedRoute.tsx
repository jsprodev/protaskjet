// ============================================
// routes/ProtectedRoute.tsx
// ============================================
// Purpose: Protects routes that require authentication
// If user is NOT logged in → Redirect to /login
// If user IS logged in → Show the page

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {/* <div className="text-lg">Loading... lol</div> */}
        {/* You can use a proper Spinner component here */}
      </div>
    )
  }

  // If no user is logged in, redirect to login page
  if (!session) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated, render the protected page with layout
  return (
    <ProtectedLayout>
      <Outlet /> {/* This renders DashboardPage, UsersPage, etc. */}
    </ProtectedLayout>
  )
}
