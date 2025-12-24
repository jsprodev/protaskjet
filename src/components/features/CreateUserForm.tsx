import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Loader2, AlertCircleIcon, Upload, X } from 'lucide-react'
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const { closeModal } = useModal()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'user',
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        setServerError('File size must be less than 5MB')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setServerError('Only image files are allowed')
        return
      }

      // Update form
      setValue('avatar', file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setServerError(null)
    }
  }

  const clearAvatar = () => {
    setValue('avatar', undefined)
    setAvatarPreview(null)
  }

  const onSubmit = async (data: CreateUserInput) => {
    setServerError(null)
    try {
      await usersApi.create(data)
      reset()
      setAvatarPreview(null)
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

      {/* Avatar Upload */}
      <div className="space-y-2">
        <Label htmlFor="avatar">Avatar (Optional)</Label>
        <div className="flex flex-col gap-3">
          {/* Preview */}
          {avatarPreview && (
            <div className="relative h-20 w-20">
              <img src={avatarPreview} alt="Avatar preview" className="h-full w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={clearAvatar}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* File Input */}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isSubmitting}
              className="cursor-pointer"
            />
            <Upload className="h-4 w-4 text-gray-400" />
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500">Max 5MB. Supported formats: JPEG, PNG, GIF, WebP</p>
        </div>
        {errors.avatar && <p className="text-sm text-red-500">{errors.avatar.message as string}</p>}
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
