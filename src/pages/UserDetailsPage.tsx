import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { X, SquarePen, CalendarClock, Trash2, Upload } from 'lucide-react'
import type { User } from '@/types/database.types'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { usersApi } from '@/services/api/users.api'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUserSchema, type UpdateUserInput } from '@/schemas/user.schema'
import { toast } from 'sonner'
import { AlertDialogBox } from '@/components/common/AlertDialogBox'
import { useUsers } from '@/context/UsersContext'

export const UserDetailsPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const location = useLocation()
  const [directEditUser, setDirectEditUser] = useState<boolean>(
    location.state?.directEditUser ? location.state.directEditUser : false
  )
  const [openDrawer, setOpenDrawer] = useState<boolean>(true)

  const { updateUser, deleteUser } = useUsers()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema.partial()),
  })

  const selectedRole = watch('role')

  const getUser = async (id: string) => {
    try {
      const data = await usersApi.getById(id)
      setUser(data)

      reset({
        name: data.name,
        email: data.email,
        role: data.role,
      })
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      getUser(userId)
    }
  }, [userId])

  useEffect(() => {
    if (directEditUser && !isEditing) {
      setIsEditing(true)
    }
  }, [directEditUser, isEditing])

  const handleClose = () => {
    setOpenDrawer(false)
    setTimeout(() => {
      navigate('/users')
    }, 300)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (directEditUser) {
      setDirectEditUser(false)
      handleClose()
    }
    setIsEditing(false)
    setServerError(null)
    setAvatarPreview(null)

    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
      })
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setServerError('File size must be less than 5MB')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setServerError('Only image files are allowed')
        return
      }

      setValue('avatar', file)

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

  const onSubmit = async (data: UpdateUserInput) => {
    if (!user) return
    setServerError(null)

    try {
      const updatedUser = await usersApi.update(user.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
      })
      updateUser(updatedUser)
      setUser(updatedUser)
      setAvatarPreview(null)
      toast.success('User updated successfully.')
      setIsEditing(false)
      setDirectEditUser(false)
      console.log('✅ User updated:', updatedUser)
    } catch (error) {
      console.error('❌ Error updating user:', error)
      setServerError(error instanceof Error ? error.message : 'Failed to update user')
    }
  }

  const handleDelete = async () => {
    if (!user) return
    setDeleteDialogOpen(false)
    try {
      await usersApi.delete(user.id)
      deleteUser(user.id)
      handleClose()
      toast.success('User deleted successfully.')
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  return (
    <>
      <AlertDialogBox
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        handleConfirm={handleDelete}
        description="This action cannot be undone. This will permanently delete the user."
      />

      <Drawer direction="right" open={openDrawer} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent className="w-full! bg-neutral-100 md:max-w-[50%]! lg:max-w-[37%]!">
          <DrawerHeader className="border-b p-3">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-ui-lg! font-medium text-neutral-900">
                {isEditing || directEditUser ? 'Edit User' : 'User Details'}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="hover:bg-neutral-200 hover:text-neutral-900">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
              <DrawerDescription className="sr-only">View or edit user information</DrawerDescription>
            </div>
          </DrawerHeader>

          {!loading ? (
            <>
              {!isEditing && !directEditUser ? (
                <>
                  {/* VIEW MODE */}
                  <div className="h-[calc(100vh-140px)] space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6">
                    {/* PROFILE CARD */}
                    <div className="mr-auto ml-auto flex max-w-xs flex-col items-center space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:p-5">
                      <div className="flex items-center">
                        <img
                          src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                          alt={user?.name}
                          className="size-32 rounded-full border object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col items-center space-y-1">
                        <div className="flex items-center space-x-4">
                          <h2 className="text-ui-sm font-medium text-neutral-900 capitalize">{user?.name}</h2>
                          <span className="font-mediums rounded-md border px-2 py-1 text-[11px] font-medium text-neutral-600 uppercase">
                            {user?.role}
                          </span>
                        </div>
                        <p className="text-ui-sm text-neutral-600">{user?.email}</p>
                      </div>
                    </div>

                    {/* Created At Updated At */}
                    <div className="flex items-center justify-between space-x-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:p-5">
                      <div className="flex-1 space-y-2">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <CalendarClock size={16} />
                          Created At
                        </div>
                        <div className="text-ui-sm text-neutral-900">
                          {user?.created_at &&
                            new Date(user?.created_at).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-neutral-200/70" />
                      <div className="flex-1 space-y-2">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <CalendarClock size={16} />
                          Updated At
                        </div>
                        <div className="text-ui-sm text-neutral-900">
                          {user?.updated_at &&
                            new Date(user?.updated_at).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DrawerFooter className="border-t">
                    <div className="flex items-center justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(true)}
                        size={'lg'}
                        className="text-ui-sm w-full flex-1 gap-2 p-2 hover:border-red-300 hover:bg-red-50 hover:text-neutral-700 active:scale-[0.98]"
                      >
                        <Trash2 />
                        Delete User
                      </Button>
                      <Button
                        onClick={handleEdit}
                        variant={'outline'}
                        size={'lg'}
                        className="text-ui-sm w-full flex-1 gap-2 p-2 hover:border-amber-300 hover:bg-amber-50 hover:text-neutral-700 active:scale-[0.98]"
                      >
                        <SquarePen />
                        Edit User
                      </Button>
                    </div>
                  </DrawerFooter>
                </>
              ) : (
                /* EDIT MODE */
                <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <div className="h-[calc(100vh-140px)] space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6">
                    {serverError && (
                      <Alert variant="destructive">
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex flex-1 gap-4">
                      <div className="w-full space-y-2">
                        <Label htmlFor="name">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          {...register('name')}
                          id="name"
                          placeholder="User name"
                          className={`bg-white ${errors.name ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                      </div>

                      <div className="w-full space-y-2">
                        <Label htmlFor="email">
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

                    <div className="flex flex-1 gap-4">
                      <div className="w-full space-y-2">
                        <Label htmlFor="avatar">Avatar (Optional)</Label>
                        <div className="flex flex-col gap-3">
                          {/* File Input */}
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              id="avatar"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              disabled={isSubmitting}
                              className="cursor-pointe bg-white"
                            />
                          </div>

                          {/* Help Text */}
                          <p className="text-ui-xs text-neutral-400">
                            Max 5MB. Supported formats: JPEG, PNG, GIF, WebP
                          </p>

                          {/* Current Avatar Preview */}
                          {user?.avatar_url && !avatarPreview && (
                            <div className="relative mt-2 h-32 w-32">
                              <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="h-full w-full rounded-2xl border object-cover"
                              />
                            </div>
                          )}

                          {/* New Avatar Preview */}
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
                      </div>
                      {errors.avatar && <p className="text-sm text-red-500">{errors.avatar.message as string}</p>}

                      <div className="w-full space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={selectedRole || ''}
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
                        {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
                      </div>
                    </div>
                  </div>

                  <DrawerFooter className="border-t pt-4">
                    <div className="flex gap-2">
                      <Button
                        size={'lg'}
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="text-ui-sm w-full flex-1 font-normal hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 active:scale-[0.98]"
                      >
                        Cancel
                      </Button>
                      <Button
                        size={'lg'}
                        type="submit"
                        disabled={isSubmitting}
                        className="text-ui-sm focus-visible:ring-offset-background w-full flex-1 rounded-lg border border-blue-600 bg-blue-600 font-medium text-white transition-colors hover:border-blue-500 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] active:border-blue-500 active:bg-blue-500 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300 disabled:text-white/80"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </DrawerFooter>
                </form>
              )}
            </>
          ) : (
            <Loader />
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
