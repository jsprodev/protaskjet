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
      //  Optional: Redirect after success
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">
      <h1 className="text-2xl font-bold">Create Account</h1>

      {/* ✅ Success Message */}
      {successMessage && (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* ✅ Error Message */}
      {serverError && (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-700">{serverError}</AlertDescription>
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
            className={`h-10 ${errors.name ? 'border-red-500' : ''}`}
            type="text"
            placeholder="Your name"
            autoComplete="name"
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

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
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="mb-1">
            Confirm Password
          </Label>
          <Input
            {...register('confirmPassword')}
            id="confirmPassword"
            className={`h-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button className="h-10 w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
