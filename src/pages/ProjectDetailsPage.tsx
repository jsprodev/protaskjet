import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { X, SquarePen, CalendarClock, Trash2, CalendarIcon } from 'lucide-react'
import type { Project } from '@/types/database.types'
import { useParams, useNavigate } from 'react-router-dom'
import { projectsApi } from '@/services/api/projects.api'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, type CreateProjectInput } from '@/schemas/project.schema'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, parseISO } from 'date-fns' // ← ADD THIS IMPORT

export const ProjectDetailsPage = () => {
  const [openStartDate, setOpenStartDate] = useState(false)
  const [openEndDate, setOpenEndDate] = useState(false)

  // ✅ ADD: State for date objects
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  })

  const getProject = async (id: string) => {
    try {
      const data = await projectsApi.getById(id)
      setProject(data)

      // ✅ FIXED: Parse ISO dates from database
      const parsedStartDate = data.start_date ? parseISO(data.start_date) : undefined
      const parsedEndDate = data.end_date ? parseISO(data.end_date) : undefined

      setStartDate(parsedStartDate)
      setEndDate(parsedEndDate)

      // Set form values
      reset({
        name: data.name,
        description: data.description || '',
        status: data.status,
        start_date: data.start_date || '',
        end_date: data.end_date || '',
      })
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      getProject(id)
    }
  }, [id])

  const handleClose = () => {
    navigate('/projects')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setServerError(null)

    // Reset form to original values
    if (project) {
      const parsedStartDate = project.start_date ? parseISO(project.start_date) : undefined
      const parsedEndDate = project.end_date ? parseISO(project.end_date) : undefined

      setStartDate(parsedStartDate)
      setEndDate(parsedEndDate)

      reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
      })
    }
  }

  const onSubmit = async (data: CreateProjectInput) => {
    if (!project) return
    setServerError(null)

    try {
      const cleanData = {
        ...data,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        description: data.description || null,
      }

      const updatedProject = await projectsApi.update(project.id, cleanData)
      setProject(updatedProject)
      setIsEditing(false)
      console.log('✅ Project updated:', updatedProject)
    } catch (error) {
      console.error('❌ Error updating project:', error)
      setServerError(error instanceof Error ? error.message : 'Failed to update project')
    }
  }

  const handleDelete = async () => {
    if (!project) return

    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return

    try {
      await projectsApi.delete(project.id)
      navigate('/projects')
    } catch (error) {
      alert('Failed to delete project')
    }
  }

  // ✅ FIXED: Format for display (user's locale)
  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return ''
    return date.toLocaleDateString()
  }

  // ✅ FIXED: Format for database (ISO format)
  const formatDateForDB = (date: Date | undefined) => {
    if (!date) return ''
    return format(date, 'yyyy-MM-dd')
  }

  // ✅ FIXED: Handle date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date)
    setValue('start_date', formatDateForDB(date))
    setOpenStartDate(false)
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date)
    setValue('end_date', formatDateForDB(date))
    setOpenEndDate(false)
  }

  return (
    <Drawer direction="right" open={true} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="md:max-w-[70%]! lg:max-w-[50%]!">
        <DrawerHeader className="p-0">
          <div className="bg-accent flex items-center justify-between p-2">
            <DrawerTitle className="text-lg font-semibold">
              {isEditing ? 'Edit Project' : 'Project Details'}
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
            {!isEditing ? (
              <>
                {/* VIEW MODE */}
                <div className="h-[calc(100vh-130px)] space-y-5! overflow-y-auto p-4">
                  <Field>
                    <FieldSet>
                      <FieldLegend className="text-foreground mb-2">Project Name</FieldLegend>
                      <FieldDescription className="text-foreground flex items-baseline justify-between">
                        {project?.name}
                        <span
                          className={`ml-5 flex rounded-full px-2 py-1.5 text-xs/2 ${
                            project?.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : project?.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : project?.status === 'on-hold'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {project?.status}
                        </span>
                      </FieldDescription>
                    </FieldSet>
                  </Field>

                  <Field>
                    <FieldSet>
                      <FieldLegend className="text-foreground mb-2">Description</FieldLegend>
                      <FieldDescription
                        className={`${project?.description ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        {project?.description || 'No description'}
                      </FieldDescription>
                    </FieldSet>
                  </Field>

                  <div className="flex gap-4">
                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                          <CalendarIcon size={16} className="mr-1" />
                          Start Date
                        </FieldLegend>
                        <FieldDescription
                          className={`${project?.start_date ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {project?.start_date ? new Date(project.start_date).toLocaleDateString() : 'No start date'}
                        </FieldDescription>
                      </FieldSet>
                    </Field>
                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                          <CalendarIcon size={16} className="mr-1" />
                          End Date
                        </FieldLegend>
                        <FieldDescription
                          className={`${project?.end_date ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {project?.end_date ? new Date(project.end_date).toLocaleDateString() : 'No end date'}
                        </FieldDescription>
                      </FieldSet>
                    </Field>
                  </div>

                  <Field>
                    <FieldSet>
                      <FieldLegend className="text-foreground mb-2">Tasks</FieldLegend>
                      <FieldDescription className="text-foreground text-justify">No tasks yet</FieldDescription>
                    </FieldSet>
                  </Field>

                  <Field>
                    <FieldSet>
                      <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                        <CalendarClock size={16} className="mr-1" />
                        Created At
                      </FieldLegend>
                      <FieldDescription className="text-foreground">
                        {project?.created_at && new Date(project.created_at).toLocaleString()}
                      </FieldDescription>
                    </FieldSet>
                  </Field>
                </div>

                <DrawerFooter className="border-t">
                  <div className="flex items-center justify-end gap-4">
                    <Button variant="outline" onClick={handleDelete} size={'lg'} className="flex-1 border-red-200">
                      <Trash2 />
                      Delete
                    </Button>
                    <Button onClick={handleEdit} variant={'outline'} size={'lg'} className="flex-1">
                      <SquarePen />
                      Edit Project
                    </Button>
                  </div>
                </DrawerFooter>
              </>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="h-[calc(100vh-130px)] space-y-4 overflow-y-auto p-4">
                  {/* Server Error */}
                  {serverError && (
                    <Alert variant="destructive">
                      <AlertDescription>{serverError}</AlertDescription>
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
                      placeholder="Project name"
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
                      placeholder="Project description"
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      defaultValue={project?.status}
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

                  {/* ✅ FIXED: Dates with proper handling */}
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
                        {/* Hidden input for form */}
                        <input type="hidden" {...register('start_date')} />

                        <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size={'icon'}
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
                        {/* Hidden input for form */}
                        <input type="hidden" {...register('end_date')} />

                        <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size={'icon'}
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
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
  )
}
