import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { router } from '@/routes/router'
import { ProjectsProvider } from './context/ProjectsContext'
import { ModalProvider } from './context/ModalContext'
import { TasksProvider } from './context/TasksContext'

// Root component that wraps everything

export const App = () => {
  return (
    <AuthProvider>
      <ModalProvider>
        <ProjectsProvider>
          <TasksProvider>
            <RouterProvider router={router} />
          </TasksProvider>
        </ProjectsProvider>
      </ModalProvider>
    </AuthProvider>
  )
}
