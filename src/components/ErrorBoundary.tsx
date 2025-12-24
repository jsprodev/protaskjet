import React, { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

// ========== ERROR BOUNDARY COMPONENT ==========
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: (error: Error, reset: () => void) => React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)

    // Log to external service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo: errorInfo.componentStack,
    })
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error!, this.resetError)
      ) : (
        <DefaultErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} onReset={this.resetError} />
      )
    }

    return this.props.children
  }
}

// ========== DEFAULT ERROR FALLBACK UI ==========
interface DefaultErrorFallbackProps {
  error: Error | null
  errorInfo: string | null
  onReset: () => void
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, errorInfo, onReset }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-blue-50 p-5">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-5 flex justify-center">
          <AlertCircle className="size-10 text-red-500" />
        </div>

        <h1 className="mb-5 text-center text-2xl font-bold text-gray-900">Oops! Something went wrong</h1>

        <p className="mb-5 text-center text-gray-600">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-5 rounded border border-red-200 bg-red-50 p-2">
            <p className="font-mono text-sm break-words text-red-700">
              <strong>Error:</strong> {error.message || 'Unknown error'}
            </p>
            {errorInfo && (
              <details className="mt-2 text-xs text-red-600">
                <summary className="cursor-pointer font-semibold">Stack trace</summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded border border-red-100 bg-white p-2">
                  {errorInfo}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex gap-5">
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
          >
            <Home className="size-4" />
            Home
          </button>
        </div>
      </div>
    </div>
  )
}

// ========== ROUTE ERROR ELEMENT (for React Router errorElement prop) ==========
export const RouteErrorElement: React.FC = () => {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // This captures errors from route loaders/actions
    const handleError = (event: ErrorEvent) => {
      setError(event.error)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 flex justify-center">
          <AlertCircle className="h-16 w-16 text-yellow-600" />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Page Not Found</h1>

        <p className="mb-6 text-center text-gray-600">
          The page you're looking for doesn't exist or an error occurred while loading it.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Go Back
          </button>

          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  )
}

// ========== HOOK FOR ASYNC ERRORS (in components) ==========
export const useAsyncError = () => {
  const [, setError] = useState()

  return useCallback(
    (error: Error) => {
      setError(() => {
        throw error
      })
    },
    [setError]
  )
}

// ========== EXAMPLE ROUTER SETUP ==========
/*
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <Navigate to="/dashboard" replace />
      </ErrorBoundary>
    ),
    errorElement: <RouteErrorElement />,
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
      },
    ],
    errorElement: <RouteErrorElement />,
  },
  // ========== 404 ==========
  { path: '*', element: <RouteErrorElement /> },
]);
*/

// ========== USAGE EXAMPLES ==========
/*
// 1. Wrap components:
export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

// 2. For async errors in components:
function MyComponent() {
  const throwError = useAsyncError();

  useEffect(() => {
    fetchData()
      .catch(error => throwError(error));
  }, [throwError]);
}

// 3. With custom fallback:
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Custom error: {error.message}</p>
      <button onClick={reset}>Reset</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
*/
