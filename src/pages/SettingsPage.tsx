/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Eye, EyeOff, Loader2, User, UserLock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AuthContext } from '@/context/AuthContext'
import { usersApi } from '@/services/api/users.api'
import { supabase } from '@/lib/supabaseClient'
import { useUsers } from '@/context/UsersContext'
import { Loader } from '@/components/ui/loader'

// Schemas
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export const SettingsPage = () => {
  const authContext = useContext(AuthContext)
  const { users, updateUser } = useUsers()
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  if (!authContext) throw new Error('AuthContext must be used within AuthProvider')
  const { user } = authContext

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Load current user profile from context
  useEffect(() => {
    if (!user || users.length === 0) return

    const userData = users.find((u) => u.id === user.id)
    if (userData) {
      setCurrentUser(userData)
      resetProfile({
        name: userData.name,
        email: userData.email,
      })
      setAvatarPreview(userData.avatar_url)
      setLoadingProfile(false)
    }
  }, [user, users, resetProfile])

  // Handle avatar file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Profile update handler
  const onSubmitProfile = async (data: ProfileFormData) => {
    if (!user) return
    try {
      const updateData: any = {
        name: data.name,
        email: data.email,
      }

      if (avatarFile) {
        updateData.avatar = avatarFile
      }

      const updatedUser = await usersApi.update(user.id, updateData)
      setCurrentUser(updatedUser)
      updateUser(updatedUser)
      setAvatarFile(null)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  // Password change handler
  const onSubmitPassword = async (data: PasswordFormData) => {
    if (!user) return
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.current_password,
      })

      if (signInError) {
        toast.error('Current password is incorrect')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.new_password,
      })

      if (updateError) {
        toast.error(updateError.message)
        return
      }

      toast.success('Password changed successfully')
      resetPassword()
    } catch (error) {
      console.error('Password change error:', error)
      toast.error('Failed to change password')
    }
  }

  if (loadingProfile) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-ui-xl font-semibold text-neutral-900">Account Settings</h1>
        <p className="text-ui-sm text-neutral-500">Manage your profile and account security</p>
      </div>

      <div className="mx-auto max-w-lg space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-ui-md flex flex-1 items-center justify-center gap-1 rounded-lg py-2.5 font-medium transition-all ${
              activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <User className="size-4.5" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`text-ui-md flex flex-1 items-center justify-center gap-1 rounded-lg py-2.5 font-medium transition-all ${
              activeTab === 'account' ? 'bg-white text-blue-600 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UserLock className="size-4.5" />
            Account
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="mb-8">
              <h2 className="text-ui-md font-semibold text-neutral-900">Profile Information</h2>
              <p className="text-ui-sm text-neutral-500">Update your personal details</p>
            </div>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center justify-center gap-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-3xl font-semibold text-white shadow-lg">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-neutral-900">Profile Picture</Label>
                    <p className="mt-0.5 text-xs text-neutral-500">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                  <label htmlFor="avatar-upload">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 font-normal hover:bg-neutral-50"
                      asChild
                    >
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Upload photo
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-100" />

              {/* Form Fields */}
              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-neutral-900">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    {...registerProfile('name')}
                    placeholder="Enter your full name"
                    disabled={isSubmittingProfile}
                    className="h-10"
                  />
                  {profileErrors.name && <p className="text-sm text-red-500">{profileErrors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-neutral-900">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerProfile('email')}
                    placeholder="your.email@example.com"
                    disabled={isSubmittingProfile}
                    className="h-10"
                  />
                  {profileErrors.email && <p className="text-sm text-red-500">{profileErrors.email.message}</p>}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-900">Role</Label>
                  <div className="flex h-10 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3">
                    <span className="text-sm text-neutral-600 capitalize">{currentUser?.role || 'user'}</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="gap-2 border border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700 active:scale-[0.98]"
                >
                  {isSubmittingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="mb-8">
              <h2 className="text-ui-md font-semibold text-neutral-900">Change Password</h2>
              <p className="text-ui-sm text-neutral-500">Update your account password</p>
            </div>

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-5">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current_password" className="text-sm font-medium text-neutral-900">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...registerPassword('current_password')}
                    placeholder="Enter current password"
                    disabled={isSubmittingPassword}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="text-sm text-red-500">{passwordErrors.current_password.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-sm font-medium text-neutral-900">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    {...registerPassword('new_password')}
                    placeholder="Enter new password (min 8 characters)"
                    disabled={isSubmittingPassword}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.new_password && (
                  <p className="text-sm text-red-500">{passwordErrors.new_password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm font-medium text-neutral-900">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerPassword('confirm_password')}
                    placeholder="Confirm new password"
                    disabled={isSubmittingPassword}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirm_password && (
                  <p className="text-sm text-red-500">{passwordErrors.confirm_password.message}</p>
                )}
              </div>

              {/* Update Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="gap-2 border border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700 active:scale-[0.98]"
                >
                  {isSubmittingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
