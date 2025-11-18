import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { loginSchema, type LoginInput } from '@/schemas/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const LoginForm = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)

    const { email, password } = data
    const { error } = await signIn(email, password)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setServerError('Invalid email or password')
      } else {
        setServerError(error.message)
      }
    } else {
      // ✅ Success - navigate to dashboard
      navigate('/dashboard')
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Login</h1>

      {serverError && (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-700">{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1">
            Email
          </Label>
          <Input
            {...register('email')}
            id="email"
            className={`h-10 ${errors.email ? 'border-red-500' : ''}`}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password" className="mb-1">
            Password
          </Label>
          <Input
            {...register('password')}
            id="password"
            className={`h-10 ${errors.password ? 'border-red-500' : ''}`}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            disabled={isSubmitting}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <Button className="h-10 w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </>
  )
}
