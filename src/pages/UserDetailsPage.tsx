import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
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
        <DrawerContent className="md:max-w-[60%]! lg:max-w-[40%]!">
          <DrawerHeader className="p-0">
            <div className="bg-accent flex items-center justify-between p-2">
              <DrawerTitle className="text-lg font-semibold">
                {isEditing || directEditUser ? 'Edit User' : 'User Details'}
              </DrawerTitle>
              <div className="flex gap-2">
                <DrawerClose asChild onClick={handleClose}>
                  <Button variant="ghost" size="icon" className="hover:bg-red-500 hover:text-white">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>

          {!loading ? (
            <>
              {!isEditing && !directEditUser ? (
                <>
                  {/* VIEW MODE */}
                  <div className="relative h-[calc(100vh-130px)] space-y-5! overflow-y-auto p-4">
                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2">Avatar</FieldLegend>
                        <FieldDescription className="text-foreground">
                          <img
                            src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.name}
                            alt={user?.name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        </FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2">Name</FieldLegend>
                        <FieldDescription className="text-foreground flex items-baseline justify-between">
                          {user?.name}
                          <span className={`ml-5 flex rounded-full bg-blue-100 px-2 py-1.5 text-xs/2 text-blue-700`}>
                            {user?.role}
                          </span>
                        </FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2">Email</FieldLegend>
                        <FieldDescription className="text-foreground">{user?.email}</FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                          <CalendarClock size={16} className="mr-1" />
                          Created At
                        </FieldLegend>
                        <FieldDescription className="text-foreground">
                          {user?.created_at && new Date(user.created_at).toLocaleString()}
                        </FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                          <CalendarClock size={16} className="mr-1" />
                          Last Updated
                        </FieldLegend>
                        <FieldDescription className="text-foreground">
                          {user?.updated_at && new Date(user.updated_at).toLocaleString()}
                        </FieldDescription>
                      </FieldSet>
                    </Field>
                  </div>

                  <DrawerFooter className="border-t">
                    <div className="flex items-center justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(true)}
                        size={'lg'}
                        className="flex-1 border-red-200"
                      >
                        <Trash2 />
                        Delete User
                      </Button>
                      <Button onClick={handleEdit} variant={'outline'} size={'lg'} className="flex-1">
                        <SquarePen />
                        Edit User
                      </Button>
                    </div>
                  </DrawerFooter>
                </>
              ) : (
                /* EDIT MODE */
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="h-[calc(100vh-130px)] space-y-4 overflow-y-auto p-4">
                    {serverError && (
                      <Alert variant="destructive">
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register('name')}
                        id="name"
                        placeholder="User name"
                        className={errors.name ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

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

                    {/* Avatar Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Avatar (Optional)</Label>
                      <div className="flex flex-col gap-3">
                        {/* Current Avatar Preview */}
                        {user?.avatar_url && !avatarPreview && (
                          <div className="relative h-20 w-20">
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          </div>
                        )}

                        {/* New Avatar Preview */}
                        {avatarPreview && (
                          <div className="relative h-20 w-20">
                            <img
                              src={avatarPreview}
                              alt="Avatar preview"
                              className="h-full w-full rounded-lg object-cover"
                            />
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

                        <p className="text-xs text-gray-500">Max 5MB. Supported formats: JPEG, PNG, GIF, WebP</p>
                      </div>
                      {errors.avatar && <p className="text-sm text-red-500">{errors.avatar.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={selectedRole || ''}
                        onValueChange={(value) => setValue('role', value as any)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
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

                  <DrawerFooter className="border-t pt-4">
                    <div className="flex gap-2">
                      <Button
                        size={'lg'}
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size={'lg'}
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
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
