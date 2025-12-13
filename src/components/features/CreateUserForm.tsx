import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Loader2, AlertCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { createUserSchema, type CreateUserInput } from '@/schemas/user.schema'
import { usersApi } from '@/services/api/users.api'
import { toast } from 'sonner'
import { useModal } from '@/context/ModalContext'

type CreateUserFormProps = {
  onSuccess?: () => void
}

export const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null)
  const { closeModal } = useModal()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      avatar_url: '',
      role: 'user',
    },
  })

  const onSubmit = async (data: CreateUserInput) => {
    setServerError(null)
    try {
      await usersApi.create(data)
      reset()
      toast.success('User created successfully!')
      closeModal()
      onSuccess?.()
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to create user')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Server Error */}
      {serverError && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{serverError}</AlertTitle>
        </Alert>
      )}

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register('email')}
          id="email"
          type="email"
          placeholder="user@example.com"
          className={errors.email ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register('name')}
          id="name"
          placeholder="John Doe"
          className={errors.name ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* Avatar URL */}
      <div className="space-y-2">
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input
          {...register('avatar_url')}
          id="avatar_url"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          className={errors.avatar_url ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.avatar_url && <p className="text-sm text-red-500">{errors.avatar_url.message}</p>}
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">
          Role <span className="text-red-500">*</span>
        </Label>
        <Select defaultValue="user" onValueChange={(value) => setValue('role', value as any)} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </form>
  )
}
