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
      setServerError(error.message.includes('Invalid login credentials') ? 'Invalid email or password' : error.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-ui-xl font-semibold text-neutral-900">Log in to you Account</h1>
        <p className="text-ui-sm text-neutral-500">Welcome back. Log in to manage your projects and tasks.</p>
      </div>

      {/* Error */}
      {serverError && (
        <Alert className="rounded-lg border border-rose-200 bg-rose-50">
          <AlertDescription className="text-ui-sm text-rose-700">{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-ui-xs font-medium text-neutral-600">
            Email
          </Label>

          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            className={`text-ui-sm h-10 rounded-lg bg-white ${
              errors.email
                ? 'border-rose-400 focus-visible:ring-rose-400'
                : 'border-neutral-200 focus-visible:ring-neutral-300'
            }`}
          />

          {errors.email && <p className="text-ui-xs text-rose-600">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-ui-xs font-medium text-neutral-600">
            Password
          </Label>

          <Input
            {...register('password')}
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isSubmitting}
            className={`text-ui-sm h-10 rounded-lg bg-white ${
              errors.password
                ? 'border-rose-400 focus-visible:ring-rose-400'
                : 'border-neutral-200 focus-visible:ring-neutral-300'
            }`}
          />

          {errors.password && <p className="text-ui-xs text-rose-600">{errors.password.message}</p>}
        </div>

        {/* CTA */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-ui-sm focus-visible:ring-offset-background h-10 w-full flex-1 rounded-lg border border-blue-600 bg-blue-600 font-medium text-white transition-colors hover:border-blue-500 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] active:border-blue-500 active:bg-blue-500 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300 disabled:text-white/80"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-ui-sm text-center font-medium text-neutral-500">
        Don’t have an account?{' '}
        <Link to="/signup" className="font-medium text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
