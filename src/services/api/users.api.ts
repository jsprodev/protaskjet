import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types/database.types'
import type { CreateUserInput, UpdateUserInput } from '@/schemas/user.schema'

export const usersApi = {
  // Create new user (usually after auth signup)
  create: async (data: CreateUserInput) => {
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        name: data.name,
        avatar_url: data.avatar_url || null,
        role: data.role,
      })
      .select()
      .single()

    if (error) throw error
    return user as User
  },

  // Get all users
  getAll: async () => {
    const { data, error } = await supabase.from('users').select('*').order('name', { ascending: true })

    if (error) throw error
    return data as User[]
  },

  // Get single user
  getById: async (id: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()

    if (error) throw error
    return data as User
  },

  // Get current user
  getCurrentUser: async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) throw new Error('User not authenticated')

    const { data, error } = await supabase.from('users').select('*').eq('email', authUser.email).single()

    if (error) throw error
    return data as User
  },

  // Update user
  update: async (id: string, updates: UpdateUserInput) => {
    const cleanData = {
      ...(updates.name && { name: updates.name }),
      ...(updates.email && { email: updates.email }),
      ...(updates.avatar_url !== undefined && { avatar_url: updates.avatar_url || null }),
      ...(updates.role && { role: updates.role }),
    }

    const { data, error } = await supabase.from('users').update(cleanData).eq('id', id).select().single()

    if (error) throw error
    return data as User
  },

  // Delete user
  delete: async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id)

    if (error) throw error
  },

  // Get users by role
  getByRole: async (role: 'admin' | 'manager' | 'developer') => {
    const { data, error } = await supabase.from('users').select('*').eq('role', role).order('name', { ascending: true })

    if (error) throw error
    return data as User[]
  },
}
