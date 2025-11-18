import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'completed', 'on-hold']).default('active'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
