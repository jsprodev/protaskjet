// ============================================
// 2. API SERVICE: services/api/projects.api.ts
// ============================================

import { supabase } from '@/lib/supabaseClient'
import type { Project } from '@/types/database.types'
import type { CreateProjectInput } from '@/schemas/project.schema'

export const projectsApi = {
  // Create new project
  create: async (data: CreateProjectInput) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        description: data.description || null,
        status: data.status,
        start_date: data.start_date || null, // ✅ This fixes it
        end_date: data.end_date || null, // ✅ This fixes it
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return project as Project
  },

  // Get all projects
  getAll: async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })

    if (error) throw error
    return data as Project[]
  },

  // Get single project
  getById: async (id: string) => {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()

    if (error) throw error
    return data as Project
  },

  update: async (id: string, updates: Partial<CreateProjectInput>) => {
    const cleanData = {
      name: updates.name,
      description: updates.description || null,
      status: updates.status,
      start_date: updates.start_date || null,
      end_date: updates.end_date || null,
    }

    const { data, error } = await supabase.from('projects').update(cleanData).eq('id', id).select().single()

    if (error) throw error
    return data as Project
  },

  // Delete project
  delete: async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) throw error
  },
}

// Update project
// update: async (id: string, updates: Partial<CreateProjectInput>) => {
//   const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single()

//   if (error) throw error
//   return data as Project
// },
