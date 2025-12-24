import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types/database.types'
import type { CreateUserInput, UpdateUserInput } from '@/schemas/user.schema'

export const usersApi = {
  // Create new user
  create: async (data: CreateUserInput) => {
    let avatar_url = null

    // If file is provided, convert to data URL
    if (data.avatar) {
      avatar_url = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(data.avatar!)
      })
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        name: data.name,
        avatar_url: avatar_url,
        role: data.role,
      })
      .select()
      .single()

    if (error) {
      console.error('User creation error:', error)
      throw new Error(error.message || 'Failed to create user')
    }

    return newUser as User
  },

  // Get all users
  getAll: async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })

    if (error) throw error
    return data as User[]
  },

  // Get single user
  getById: async (id: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()

    if (error) throw error
    return data as User
  },

  // Get users by role
  getByRole: async (role: 'admin' | 'manager' | 'user') => {
    const { data, error } = await supabase.from('users').select('*').eq('role', role).order('name', { ascending: true })

    if (error) throw error
    return data as User[]
  },

  // Update user
  update: async (id: string, updates: UpdateUserInput) => {
    const cleanData: Record<string, any> = {}

    if (updates.name !== undefined) cleanData.name = updates.name
    if (updates.email !== undefined) cleanData.email = updates.email
    if (updates.role !== undefined) cleanData.role = updates.role
    if (updates.avatar !== undefined && updates.avatar) {
      // Convert file to data URL
      const avatar_url = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(updates.avatar!)
      })
      cleanData.avatar_url = avatar_url
    }

    console.log('Updating user:', id, cleanData)

    const { error } = await supabase.from('users').update(cleanData).match({ id })

    if (error) {
      console.error('Update error:', error)
      throw error
    }

    // Fetch the updated user separately
    const { data, error: fetchError } = await supabase.from('users').select('*').eq('id', id).single()

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      throw fetchError
    }

    return data as User
  },

  // Delete user
  delete: async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
  },
}
