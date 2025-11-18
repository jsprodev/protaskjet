export type User = {
  id: string
  email: string
  name: string
  avatar_url: string | null
  role: 'admin' | 'user' | 'manager'
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  name: string
  description: string | null
  status: 'active' | 'archived' | 'completed' | 'on-hold'
  created_by: string
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  project_id: string
  assigned_to: string | null
  created_by: string
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// With relations
export type TaskWithDetails = Task & {
  project: Pick<Project, 'id' | 'name'>
  assigned_user: Pick<User, 'id' | 'name' | 'email'> | null
  created_by_user: Pick<User, 'id' | 'name'>
}

export type ProjectWithStats = Project & {
  total_tasks: number
  completed_tasks: number
  completion_percentage: number
}
