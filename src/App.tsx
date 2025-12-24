import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { router } from '@/routes/router'
import { ProjectsProvider } from './context/ProjectsContext'
import { ModalProvider } from './context/ModalContext'
import { TasksProvider } from './context/TasksContext'
import { UserProvider } from './context/UsersContext'
import { ErrorBoundary } from './components/ErrorBoundary'

// Root component that wraps everything

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ModalProvider>
          <UserProvider>
            <ProjectsProvider>
              <TasksProvider>
                <RouterProvider router={router} />
              </TasksProvider>
            </ProjectsProvider>
          </UserProvider>
        </ModalProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
