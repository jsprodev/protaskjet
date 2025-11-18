// ============================================
// routes/PublicRoute.tsx
// ============================================
// Purpose: Routes that ONLY non-authenticated users can access
// If user IS logged in → Redirect to /dashboard
// If user is NOT logged in → Show the page (login, signup)

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PublicLayout } from '@/components/layout/PublicLayout'

export function PublicRoute() {
  const { session, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // If user is already logged in, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  // User is NOT logged in, render the public page with layout
  return (
    <PublicLayout>
      <Outlet /> {/* This renders LoginPage, SignupPage, etc. */}
    </PublicLayout>
  )
}
