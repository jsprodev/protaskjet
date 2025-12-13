import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Project } from '@/types/database.types'
import { projectsApi } from '@/services/api/projects.api'

type ProjectsContextType = {
  projects: Project[]
  loading: boolean
  error: string | null
  loadProjects: () => Promise<void>
  addProject: (project: Project) => void
  updateProjects: (project: Project) => void
  // deleteProject: (project: Project) => void
  deleteProject: (projectId: string) => void
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await projectsApi.getAll()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const addProject = (project: Project) => {
    setProjects((prevProjects) => [project, ...prevProjects]) //  add latest project in the beginning
  }
  const updateProjects = (project: Project) => {
    setProjects((prevProjects) => prevProjects.map((p) => (p.id === project.id ? project : p)))
  }

  // const deleteProject = (project: Project) => {
  //   setProjects((prevProjects) => prevProjects.filter((p) => p.id !== project.id))
  // }

  const deleteProject = (projectId: string) => {
    setProjects((prevProjects) => prevProjects.filter((p) => p.id !== projectId))
  }

  return (
    <ProjectsContext.Provider
      value={{ projects, loading, error, loadProjects, addProject, updateProjects, deleteProject }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export const useProjects = () => {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}
