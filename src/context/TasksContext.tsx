import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { TaskWithDetails } from '@/types/database.types'
import { tasksApi } from '@/services/api/tasks.api'

type TasksContextType = {
  tasks: TaskWithDetails[]
  loading: boolean
  error: string | null
  loadTasks: () => Promise<void>
  addTask: (task: TaskWithDetails) => void
  updateTask: (task: TaskWithDetails) => void
  deleteTask: (taskId: string) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await tasksApi.getAll()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const addTask = (task: TaskWithDetails) => {
    setTasks((prevTasks) => [task, ...prevTasks])
  }

  const updateTask = (task: TaskWithDetails) => {
    setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? task : t)))
  }

  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId))
  }

  return (
    <TasksContext.Provider value={{ tasks, loading, error, loadTasks, addTask, updateTask, deleteTask }}>
      {children}
    </TasksContext.Provider>
  )
}

export const useTasks = () => {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider')
  }
  return context
}
