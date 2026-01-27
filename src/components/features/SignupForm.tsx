import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { signupSchema, type SignupInput } from '@/schemas/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const SignupForm = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: SignupInput) => {
    // Clear previous messages
    setServerError(null)
    setSuccessMessage(null)

    const { email, password, name } = data

    // ✅ Use signUp from context (consistent with other auth methods)
    const { error } = await signUp(email, password, name)

    if (error) {
      setServerError(error.message)
      console.error('Signup error:', error)
    } else {
      // ✅ Better success handling
      setSuccessMessage('Account created! Check your email for verification.')
      reset()
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-ui-xl font-semibold text-neutral-900">Create your Account</h1>
        <p className="text-ui-sm text-neutral-500">Its free and always will be.</p>
      </div>

      {/* ✅ Success Message */}
      {successMessage && (
        <Alert className="border-emerald-500 bg-emerald-50">
          <AlertDescription className="text-emerald-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* ✅ Error Message */}
      {serverError && (
        <Alert className="rounded-lg border border-rose-200 bg-rose-50">
          <AlertDescription className="text-ui-sm text-rose-700">{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-1">
            Name
          </Label>
          <Input
            {...register('name')}
            id="name"
            className={`text-ui-sm h-10 rounded-lg bg-white ${
              errors.name
                ? 'border-rose-400 focus-visible:ring-rose-400'
                : 'border-neutral-200 focus-visible:ring-neutral-300'
            }`}
            type="text"
            placeholder="Your name"
            autoComplete="name"
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-ui-xs text-rose-600">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="mb-1">
            Email
          </Label>
          <Input
            {...register('email')}
            id="email"
            className={`text-ui-sm h-10 rounded-lg bg-white ${
              errors.email
                ? 'border-rose-400 focus-visible:ring-rose-400'
                : 'border-neutral-200 focus-visible:ring-neutral-300'
            }`}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-ui-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password" className="mb-1">
            Password
          </Label>
          <Input
            {...register('password')}
            id="password"
            className={`text-ui-sm h-10 rounded-lg bg-white ${
              errors.password
                ? 'border-rose-400 focus-visible:ring-rose-400'
                : 'border-neutral-200 focus-visible:ring-neutral-300'
            }`}
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {errors.password && <p className="text-ui-xs text-rose-600">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="mb-1">
            Confirm Password
          </Label>
          <Input
            {...register('confirmPassword')}
            id="confirmPassword"
            className={`text-ui-sm h-10 rounded-lg bg-white ${
              errors.confirmPassword
                ? 'border-rose-400 focus-visible:ring-rose-400'
                : 'border-neutral-200 focus-visible:ring-neutral-300'
            }`}
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {errors.confirmPassword && <p className="text-ui-xs text-rose-600">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          className="text-ui-sm focus-visible:ring-offset-background h-10 w-full flex-1 rounded-lg border border-blue-600 bg-blue-600 font-medium text-white transition-colors hover:border-blue-500 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] active:border-blue-500 active:bg-blue-500 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300 disabled:text-white/80"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <p className="text-ui-sm text-center font-medium text-neutral-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
