import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import {
  X,
  SquarePen,
  CalendarClock,
  Trash2,
  CalendarIcon,
  CheckCircle2,
  Circle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ShieldAlert,
  CircleCheckBig,
} from 'lucide-react'
import type { Project } from '@/types/database.types'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { projectsApi } from '@/services/api/projects.api'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, type CreateProjectInput } from '@/schemas/project.schema'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, parseISO } from 'date-fns'
import { useProjects } from '@/context/ProjectsContext'
import { toast } from 'sonner'
import { AlertDialogBox } from '@/components/common/AlertDialogBox'
import { useTasks } from '@/context/TasksContext'

export const ProjectDetailsPage = () => {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [startDatePopover, setStartDatePopover] = useState(false)
  const [endDatePopover, setEndDatePopover] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { updateProjects, deleteProject } = useProjects()
  const { tasks } = useTasks()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [openDrawer, setOpenDrawer] = useState<boolean>(true)
  const location = useLocation()
  const [directEditProject, setDirectEditProject] = useState<boolean>(location.state?.directEditProject ?? false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  })

  // Get tasks for this project
  const projectTasks = tasks.filter((task) => task.project_id === id)
  const completedTasks = projectTasks.filter((task) => task.status === 'done')

  // Fetch project by id
  const getProject = async (id: string) => {
    try {
      const data = await projectsApi.getById(id)
      setProject(data)

      const parsedStartDate = data.start_date ? parseISO(data.start_date) : undefined
      const parsedEndDate = data.end_date ? parseISO(data.end_date) : undefined
      setStartDate(parsedStartDate)
      setEndDate(parsedEndDate)

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
    if (id) getProject(id)
  }, [id])

  const handleClose = () => {
    setOpenDrawer(false)
    setTimeout(() => navigate('/projects'), 300)
  }

  const handleEdit = () => setIsEditing(true)

  const handleCancelEdit = () => {
    if (directEditProject) {
      setDirectEditProject(false)
      handleClose()
    }
    setIsEditing(false)
    setServerError(null)

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
      const updatedProject = await projectsApi.update(project.id, data)
      updateProjects(updatedProject)
      setProject(updatedProject)
      toast.success('Project updated successfully.')
      setIsEditing(false)
      setDirectEditProject(false)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to update project')
    }
  }

  const handleDelete = async () => {
    if (!project) return
    setDeleteDialogOpen(false)
    try {
      await projectsApi.delete(project.id)
      deleteProject(project.id)
      handleClose()
      toast.success('Project deleted successfully.')
    } catch (err) {
      toast.dismiss(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  const formatDateForDisplay = (date?: Date) =>
    date
      ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : ''
  const formatDateForDB = (date?: Date) => (date ? format(date, 'yyyy-MM-dd') : '')
  const handleStartDateSelect = (date?: Date) => {
    setStartDate(date)
    setValue('start_date', formatDateForDB(date))
    setStartDatePopover(false)
  }
  const handleEndDateSelect = (date?: Date) => {
    setEndDate(date)
    setValue('end_date', formatDateForDB(date))
    setEndDatePopover(false)
  }

  return (
    <>
      <AlertDialogBox
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        handleConfirm={handleDelete}
        description="This action cannot be undone. This will permanently delete your project and associated tasks."
      />

      <Drawer direction="right" open={openDrawer} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent className="w-full! bg-neutral-100 md:max-w-[70%]! lg:max-w-[50%]!">
          {/* HEADER */}
          <DrawerHeader className="border-b p-3">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-ui-lg! font-medium text-neutral-900">
                {isEditing || directEditProject ? 'Edit Project' : 'Project Details'}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="hover:bg-neutral-200 hover:text-neutral-900">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
              <DrawerDescription className="sr-only">View or edit project information</DrawerDescription>
            </div>
          </DrawerHeader>
          {!loading ? (
            <>
              {/* CONTENT VIEW MODE */}
              {!isEditing && !directEditProject ? (
                <>
                  <div className="h-[calc(100vh-140px)] space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6">
                    {/* Project Name */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:p-5">
                      <div className="flex items-start justify-between">
                        <h3 className="text-ui-md font-medium text-neutral-900">{project?.name}</h3>
                        <div
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap uppercase"
                          style={{
                            backgroundColor: `color-mix(in oklab, var(--status-${project?.status}) 12%, white)`,
                            color: `var(--status-${project?.status})`,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: `var(--status-${project?.status})` }}
                          />
                          {project?.status}
                        </div>
                      </div>
                      <p
                        className={`text-ui-sm mt-2.5 leading-relaxed ${project?.description ? 'text-neutral-700' : 'text-neutral-400 italic'}`}
                      >
                        {project?.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between space-x-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:p-5">
                      <div className="flex-1 space-y-2">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <CalendarIcon size={16} />
                          Start
                        </div>
                        <div
                          className={`text-ui-sm ${
                            project?.start_date ? 'text-neutral-900' : 'text-neutral-400 italic'
                          }`}
                        >
                          {project?.start_date ? formatDateForDisplay(new Date(project?.start_date)) : 'Not set'}
                        </div>
                      </div>

                      <div className="h-10 w-px bg-neutral-200/70" />

                      <div className="flex-1 space-y-2">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <CalendarIcon size={16} />
                          End
                        </div>
                        <div
                          className={`text-ui-sm ${project?.end_date ? 'text-neutral-900' : 'text-neutral-400 italic'}`}
                        >
                          {project?.end_date ? formatDateForDisplay(new Date(project?.end_date)) : 'Not set'}
                        </div>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:p-5">
                      {/* Header */}
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-ui-xs font-medium text-neutral-500 uppercase">Tasks</h4>

                        <span className="text-ui-xs font-medium text-neutral-600">
                          {projectTasks.length > 0 && (
                            <>
                              {completedTasks.length} / {projectTasks.length} completed
                            </>
                          )}
                        </span>
                      </div>

                      {projectTasks.length > 0 ? (
                        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
                          {projectTasks.map((task) => (
                            <Link
                              key={task.id}
                              to={`/tasks/${task.id}`}
                              className="group flex flex-col items-start gap-1 p-3 transition-colors first:rounded-tl-xl first:rounded-tr-xl last:rounded-br-xl last:rounded-bl-xl hover:bg-neutral-50 md:flex-row md:items-center md:justify-between"
                            >
                              <div className="flex w-full min-w-0 items-center gap-3">
                                {/* Status icon */}
                                {task.status === 'done' ? (
                                  <CircleCheckBig
                                    className="h-4 w-4 shrink-0"
                                    style={{ color: `var(--status-${task.status})` }}
                                  />
                                ) : (
                                  <Circle className="h-4 w-4 shrink-0 text-neutral-300" />
                                )}

                                {/* Title - needs min-w-0 and flex-1 */}
                                <div className="min-w-0 flex-1">
                                  <p className="text-ui-sm truncate font-normal">{task.title}</p>
                                </div>
                              </div>

                              {/* Right-side meta */}
                              <div className="flex items-center justify-end gap-1.5 max-md:w-full">
                                {/* Status */}
                                <span
                                  className="rounded-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap uppercase"
                                  style={{
                                    backgroundColor: `color-mix(in oklab, var(--status-${task.status}) 12%, white)`,
                                    color: `var(--status-${task.status})`,
                                  }}
                                >
                                  {task.status.replace('-', ' ')}
                                </span>

                                {/* Priority */}
                                <span className="text-ui-xs inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-neutral-700">
                                  {task.priority === 'low' ? (
                                    <>
                                      <ArrowDown className="size-4 text-neutral-500" /> {task.priority}
                                    </>
                                  ) : task.priority === 'medium' ? (
                                    <>
                                      <ArrowRight className="size-4 text-neutral-500" /> {task.priority}
                                    </>
                                  ) : task.priority === 'high' ? (
                                    <>
                                      <ArrowUp className="size-4 text-neutral-500" /> {task.priority}
                                    </>
                                  ) : task.priority === 'urgent' ? (
                                    <>
                                      <ShieldAlert className="size-4 text-neutral-500" /> {task.priority}
                                    </>
                                  ) : null}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-ui-sm text-neutral-400">No tasks added yet</p>
                      )}
                    </div>

                    {/* Created At Updated At */}
                    <div className="flex items-center justify-between space-x-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:p-5">
                      <div className="flex-1 space-y-2">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <CalendarClock size={13} />
                          Created At
                        </div>
                        <div className="text-ui-sm text-neutral-900">
                          {project?.created_at &&
                            new Date(project?.created_at).toLocaleString('en-GB', {
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
                          <CalendarClock size={13} />
                          Updated At
                        </div>
                        <div className="text-ui-sm text-neutral-900">
                          {project?.updated_at &&
                            new Date(project?.updated_at).toLocaleString('en-GB', {
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
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(true)}
                        size={'lg'}
                        className="text-ui-sm w-full flex-1 gap-2 rounded-lg p-2 hover:border-red-300 hover:bg-red-50 hover:text-neutral-700 active:scale-[0.98]"
                      >
                        <Trash2 />
                        Delete Project
                      </Button>
                      <Button
                        onClick={handleEdit}
                        variant={'outline'}
                        size={'lg'}
                        className="text-ui-sm w-full flex-1 gap-2 rounded-lg p-2 hover:border-amber-300 hover:bg-amber-50 hover:text-neutral-700 active:scale-[0.98]"
                      >
                        <SquarePen />
                        Edit Project
                      </Button>
                    </div>
                  </DrawerFooter>
                </>
              ) : (
                /* EDIT MODE - keeping existing form code */
                <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <div className="h-[calc(100vh-140px)] space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6">
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
                        className="rounded-lg bg-white"
                        id="name"
                        placeholder="Project name"
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
                        rows={8}
                        disabled={isSubmitting}
                        className="rounded-lg bg-white"
                      />
                    </div>

                    {/* Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          defaultValue={project?.status}
                          onValueChange={(value) => setValue('status', value as any)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full rounded-lg bg-white">
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
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <div className="relative">
                          <Input
                            value={formatDateForDisplay(startDate)}
                            placeholder="dd/mm/yyyy"
                            disabled
                            readOnly
                            className="rounded-lg bg-white opacity-100!"
                          />
                          <input type="hidden" {...register('start_date')} />
                          <Popover open={startDatePopover} onOpenChange={setStartDatePopover}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 right-2 -translate-y-1/2"
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

                      <div className="flex-1 space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <div className="relative">
                          <Input
                            value={formatDateForDisplay(endDate)}
                            placeholder="dd/mm/yyyy"
                            disabled
                            readOnly
                            className="rounded-lg bg-white opacity-100!"
                          />
                          <input type="hidden" {...register('end_date')} />
                          <Popover open={endDatePopover} onOpenChange={setEndDatePopover}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 right-2 -translate-y-1/2"
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

                  {/* FOOTER */}
                  <DrawerFooter className="border-t">
                    <div className="flex items-center justify-end gap-4">
                      <Button
                        size={'lg'}
                        variant="outline"
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="text-ui-sm w-full flex-1 rounded-lg font-normal hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 active:scale-[0.98]"
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
