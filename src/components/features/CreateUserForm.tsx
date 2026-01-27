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
import { DrawerFooter } from '../ui/drawer'
import { useUsers } from '@/context/UsersContext'

type CreateUserFormProps = {
  onSuccess?: () => void
}

export const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const { closeModal } = useModal()

  const { addUser } = useUsers()

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
      const user = await usersApi.create(data)
      addUser(user)
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      <div className="h-[calc(100vh-140px)] space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6 lg:space-y-8 lg:p-8">
        {/* Server Error */}
        {serverError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{serverError}</AlertTitle>
          </Alert>
        )}

        {/* Full Name and email */}
        <div className="flex flex-1 gap-4">
          <div className="w-full space-y-2">
            <Label htmlFor="name" className="text-ui-xs font-medium text-neutral-500">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('name')}
              id="name"
              placeholder="John Doe"
              className={`bg-white ${errors.name ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="email" className="text-ui-xs font-medium text-neutral-500">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="user@example.com"
              className={`bg-white ${errors.email ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        {/* Role and avatar */}
        <div className="flex flex-1 gap-4">
          <div className="w-full space-y-2">
            <Label htmlFor="avatar" className="text-ui-xs font-medium text-neutral-500">
              Avatar
            </Label>
            <div className="flex flex-col gap-3">
              {/* File Input */}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isSubmitting}
                  className="cursor-pointer bg-white"
                />
              </div>

              {/* Help Text */}
              <p className="text-ui-xs text-neutral-400">Max 5MB. Supported formats: JPEG, PNG, GIF, WebP</p>
              {avatarPreview && (
                <div className="relative mt-2 h-32 w-32">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full rounded-2xl border object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearAvatar}
                    className="absolute -top-3 -right-3 rounded-full border bg-neutral-100 p-1 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>
            {errors.avatar && <p className="text-sm text-red-500">{errors.avatar.message as string}</p>}
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="role" className="text-ui-xs font-medium text-neutral-500">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              defaultValue="user"
              onValueChange={(value) => setValue('role', value as any)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <DrawerFooter className="border-t">
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={isSubmitting}
            className="text-ui-sm flex-1 hover:bg-neutral-100 active:scale-[0.98]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-ui-sm flex-1 border border-blue-600 bg-blue-600 text-white hover:border-blue-500 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </DrawerFooter>
    </form>
  )
}
