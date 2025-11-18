import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z
  .object({
    name: z
      .string({ error: 'Name is required' })
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z.email('Invalid email format'),
    password: z
      .string({ error: 'Password is required' })
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string({ error: 'Please confirm your password' }).min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Type inference
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
