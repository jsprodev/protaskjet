import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Loader2, AlertCircleIcon, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { createProjectSchema, type CreateProjectInput } from '@/schemas/project.schema'
import { projectsApi } from '@/services/api/projects.api'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useProjects } from '@/context/ProjectsContext'
import { useModal } from '@/context/ModalContext'

type CreateProjectFormProps = {
  onSuccess?: () => void // ← Add callback prop
}

export const CreateProjectForm = ({ onSuccess }: CreateProjectFormProps) => {
  const { addProject } = useProjects()
  const [openStartDate, setOpenStartDate] = useState(false)
  const [openEndDate, setOpenEndDate] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [serverError, setServerError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { closeModal } = useModal()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      start_date: '',
      end_date: '',
    },
  })

  const onSubmit = async (data: CreateProjectInput) => {
    setServerError(null)
    try {
      const project = await projectsApi.create(data)
      addProject(project) // Update context
      reset() // Reset form
      toast.success('Project created successfully!')
      // onSuccess?.() // close modal
      closeModal()
      navigate('/projects')
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to create project')
    }
  }

  // ✅ FIXED: Format for display (user sees locale format)
  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return ''
    return date.toLocaleDateString() // Shows in user's locale format
  }

  // ✅ FIXED: Format for database (ISO format YYYY-MM-DD)
  const formatDateForDB = (date: Date | undefined) => {
    if (!date) return ''
    return format(date, 'yyyy-MM-dd') // ISO format for database
  }

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date)
    setValue('start_date', formatDateForDB(date)) // ← Save ISO format to form
    setOpenStartDate(false)
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date)
    setValue('end_date', formatDateForDB(date)) // ← Save ISO format to form
    setOpenEndDate(false)
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

      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Project Name <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register('name')}
          id="name"
          placeholder="e.g., Website Redesign"
          className={errors.name ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          {...register('description')}
          id="description"
          placeholder="Describe your project..."
          rows={10}
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          defaultValue="active"
          onValueChange={(value) => setValue('status', value as any)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range - FIXED */}
      <div className="flex justify-between gap-4">
        {/* Start Date */}
        <div className="flex-1">
          <Label htmlFor="start_date" className="mb-2">
            Start Date
          </Label>
          <div className="relative flex">
            <Input
              value={formatDateForDisplay(startDate)} // ← Display in locale format
              placeholder="mm/dd/yyyy"
              disabled={isSubmitting}
              readOnly
            />
            {/* Hidden input for form submission */}
            <input type="hidden" {...register('start_date')} />

            <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="size-4" />
                  <span className="sr-only">Select date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateSelect}
                  captionLayout="dropdown"
                  disabled={isSubmitting}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* End Date */}
        <div className="flex-1">
          <Label htmlFor="end_date" className="mb-2">
            End Date
          </Label>
          <div className="relative flex">
            <Input
              value={formatDateForDisplay(endDate)} // ← Display in locale format
              placeholder="mm/dd/yyyy"
              disabled={isSubmitting}
              readOnly
            />
            {/* Hidden input for form submission */}
            <input type="hidden" {...register('end_date')} />

            <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="size-4" />
                  <span className="sr-only">Select date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                  captionLayout="dropdown"
                  disabled={isSubmitting}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-3 bg-blue-600 hover:bg-blue-700">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}
