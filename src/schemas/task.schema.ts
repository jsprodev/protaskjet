import { z } from 'zod'

export const createTaskSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  title: z.string().min(3, 'Task title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done', 'blocked']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigned_to: z.string().uuid('Invalid user ID').nullable().optional(),
  due_date: z.string().optional(),
  completed_at: z.string().optional().nullable(),
  // order: z.number().int().optional(),
})

export const updateTaskSchema = createTaskSchema.partial()
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
