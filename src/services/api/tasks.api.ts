import { supabase } from '@/lib/supabaseClient'
import type { Task, TaskWithDetails } from '@/types/database.types'
import type { CreateTaskInput, UpdateTaskInput } from '@/schemas/task.schema'

export const tasksApi = {
  // Create new task
  create: async (data: CreateTaskInput) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')
    // Prepare the data exactly as Supabase expects
    const taskData = {
      project_id: data.project_id,
      title: data.title,
      description: data.description || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      assigned_to: data.assigned_to || null,
      due_date: data.due_date || null,
      created_by: user.id,
      completed_at: null,
    }
    console.log('Creating task with data:', taskData) // Debug log
    const { data: task, error } = await supabase.from('tasks').insert([taskData]).select().single()
    if (error) {
      console.error('Task creation error:', error)
      throw new Error(error.message || 'Failed to create task')
    }
    return task as Task
  },

  // Get all tasks with relations (project and assigned user)
  getAll: async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(
        `*,
        projects(id, name),
        users!tasks_assigned_to_fkey(id, name, email, avatar_url, role)`
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as TaskWithDetails[]
  },

  // Get all tasks for a project
  getByProjectId: async (projectId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select(
        `*,
        projects(id, name),
        users!tasks_assigned_to_fkey(id, name, email, avatar_url, role)`
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as TaskWithDetails[]
  },

  // Get single task
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select(
        `*,
        projects(id, name),
        users!tasks_assigned_to_fkey(id, name, email, avatar_url, role)`
      )
      .eq('id', id)
      .single()

    if (error) throw error
    return data as TaskWithDetails
  },

  // Get tasks assigned to current user
  getMyTasks: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .select(
        `*,
        projects(id, name),
        users!tasks_assigned_to_fkey(id, name, email, avatar_url, role)`
      )
      .eq('assigned_to', user.id)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data as TaskWithDetails[]
  },

  // Update task
  update: async (id: string, updates: UpdateTaskInput) => {
    const cleanData: Record<string, any> = {}

    if (updates.title) cleanData.title = updates.title
    if (updates.description !== undefined) cleanData.description = updates.description || null
    if (updates.status) cleanData.status = updates.status
    if (updates.priority) cleanData.priority = updates.priority
    if (updates.assigned_to !== undefined) cleanData.assigned_to = updates.assigned_to || null
    if (updates.due_date !== undefined) cleanData.due_date = updates.due_date || null

    const { data, error } = await supabase
      .from('tasks')
      .update(cleanData)
      .eq('id', id)
      .select(
        `*,
        projects(id, name),
        users!tasks_assigned_to_fkey(id, name, email, avatar_url, role)`
      )
      .single()

    if (error) throw error
    return data as TaskWithDetails
  },

  // Delete task
  delete: async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  },

  // Bulk update task order (for drag-and-drop)
  reorder: async (updates: { id: string; order: number }[]) => {
    const promises = updates.map(({ id, order }) => supabase.from('tasks').update({ order }).eq('id', id))
    const results = await Promise.all(promises)
    const errors = results.filter((r) => r.error)
    if (errors.length > 0) throw errors[0].error
  },
}
