import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar_url: z.string().url().optional().nullable(),
  role: z.enum(['admin', 'user', 'manager']).default('user'),
})

export const updateUserSchema = createUserSchema.partial()
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
