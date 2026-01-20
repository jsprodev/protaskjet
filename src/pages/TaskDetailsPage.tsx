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
import { X, SquarePen, CalendarClock, Trash2, CalendarIcon, User, FolderKanban, ArrowUpWideNarrow } from 'lucide-react'
import type { TaskWithDetails } from '@/types/database.types'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { tasksApi } from '@/services/api/tasks.api'
import { projectsApi } from '@/services/api/projects.api'
import { usersApi } from '@/services/api/users.api'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateTaskSchema, type UpdateTaskInput } from '@/schemas/task.schema'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, parseISO } from 'date-fns'
import { useTasks } from '@/context/TasksContext'
import { toast } from 'sonner'
import { AlertDialogBox } from '@/components/common/AlertDialogBox'

export const TaskDetailsPage = () => {
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [dueDatePopover, setDueDatePopover] = useState(false)
  const [task, setTask] = useState<TaskWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const { updateTask, deleteTask: deleteTaskFromContext } = useTasks()
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const location = useLocation()
  const [directEditTask, setDirectEditTask] = useState<boolean>(
    location.state?.directEditTask ? location.state.directEditTask : false
  )
  const [openDrawer, setOpenDrawer] = useState<boolean>(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<UpdateTaskInput>({
    resolver: zodResolver(updateTaskSchema.partial()),
  })

  const selectedStatus = watch('status')
  const selectedPriority = watch('priority')
  const selectedAssignedTo = watch('assigned_to')

  const getTask = async (id: string) => {
    try {
      const data = await tasksApi.getById(id)
      setTask(data)

      // Parse ISO date from database
      const parsedDueDate = data.due_date ? parseISO(data.due_date) : undefined
      setDueDate(parsedDueDate)

      // Set form values
      reset({
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        assigned_to: data.assigned_to || undefined,
        due_date: data.due_date || '',
      })

      // Load users and projects
      const usersData = await usersApi.getAll()
      const projectsData = await projectsApi.getAll()
      setUsers(usersData)
      setProjects(projectsData)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (taskId) {
      getTask(taskId)
    }
  }, [taskId])

  const handleClose = () => {
    setOpenDrawer(false)
    setTimeout(() => {
      navigate('/tasks')
    }, 300)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (directEditTask) {
      setDirectEditTask(false)
      handleClose()
      // navigate('/tasks')
    }
    setIsEditing(false)
    setServerError(null)

    // Reset form to original values
    if (task) {
      const parsedDueDate = task.due_date ? parseISO(task.due_date) : undefined
      setDueDate(parsedDueDate)

      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assigned_to: task.assigned_to || undefined,
        due_date: task.due_date || '',
      })
    }
  }

  const onSubmit = async (data: UpdateTaskInput) => {
    if (!task) return
    setServerError(null)

    try {
      const updatedTask = await tasksApi.update(task.id, data)
      updateTask(updatedTask)
      setTask(updatedTask)
      toast.success('Task updated successfully.')
      setIsEditing(false)
      setDirectEditTask(false)
      console.log('✅ Task updated:', updatedTask)
    } catch (error) {
      console.error('❌ Error updating task:', error)
      setServerError(error instanceof Error ? error.message : 'Failed to update task')
    }
  }

  const handleDelete = async () => {
    if (!task) return
    setDeleteDialogOpen(false)
    try {
      await tasksApi.delete(task.id)
      deleteTaskFromContext(task.id)
      handleClose()
      // navigate('/tasks')
      toast.success('Task deleted successfully.')
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return ''
    return date.toLocaleDateString()
  }

  const formatDateForDB = (date: Date | undefined) => {
    if (!date) return ''
    return format(date, 'yyyy-MM-dd')
  }

  const handleDueDateSelect = (date: Date | undefined) => {
    setDueDate(date)
    setValue('due_date', formatDateForDB(date))
    setDueDatePopover(false)
  }

  const getProjectName = () => {
    if (!task) return 'Unknown'
    const project = task.projects as any
    return Array.isArray(project) ? project[0]?.name : project?.name
  }

  const getAssignedUserName = () => {
    if (!task) return 'Unassigned'
    const user = task.users as any
    return Array.isArray(user) ? user[0]?.name : user?.name
  }

  return (
    <>
      <AlertDialogBox
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        handleConfirm={handleDelete}
        description="This action cannot be undone. This will permanently delete your task."
      />

      <Drawer direction="right" open={openDrawer} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent className="w-full! bg-neutral-50 md:max-w-[60%]! lg:max-w-[50%]!">
          <DrawerHeader className="border-b p-3">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-ui-lg! font-medium text-neutral-900">
                {isEditing || directEditTask ? 'Edit Task' : 'Task Details'}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="hover:bg-neutral-200 hover:text-neutral-900">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
              <DrawerDescription className="sr-only">View or edit task information</DrawerDescription>
            </div>
          </DrawerHeader>

          {!loading ? (
            <>
              {!isEditing && !directEditTask ? (
                <>
                  <div className="h-[calc(100vh-140px)] space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6 lg:space-y-8 lg:p-8">
                    <div className="bg-card rounded-2xl p-4 shadow-sm md:p-5">
                      <div className="flex items-start justify-between">
                        <h3 className="text-ui-md font-medium text-neutral-900">{task?.title}</h3>
                        <div
                          className="text-ui-xs flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium uppercase"
                          style={{
                            backgroundColor: `color-mix(in oklab, var(--status-${task?.status}) 12%, white)`,
                            color: `var(--status-${task?.status})`,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: `var(--status-${task?.status})` }}
                          />
                          {task?.status}
                        </div>
                      </div>
                      <p
                        className={`text-ui-sm mt-2.5 leading-relaxed ${task?.description ? 'text-neutral-700' : 'text-neutral-400 italic'}`}
                      >
                        {task?.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="bg-card flex items-center justify-between space-x-4 rounded-2xl p-4 shadow-sm md:p-5">
                      <div className="flex-1 space-y-2">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <User size={16} />
                          Assigned To
                        </div>
                        <div
                          className={`text-ui-sm ${getAssignedUserName() ? 'text-neutral-900' : 'text-neutral-400 italic'}`}
                        >
                          {getAssignedUserName() ? getAssignedUserName() : 'No assignee'}
                        </div>
                      </div>

                      <div className="h-10 w-px bg-neutral-200/70" />

                      <div className="flex-1 space-y-2">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <ArrowUpWideNarrow size={16} />
                          Priority
                        </div>
                        <div className="text-ui-xs max-w-fit rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-700">
                          {task?.priority}
                        </div>
                      </div>
                    </div>

                    <div className="bg-card flex items-center justify-between space-x-4 rounded-2xl p-4 shadow-sm md:p-5">
                      <div className="flex-1 space-y-2">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <CalendarIcon size={16} />
                          Due Date
                        </div>
                        <div
                          className={`text-ui-sm ${task?.due_date ? 'text-neutral-900' : 'text-neutral-400 italic'}`}
                        >
                          {task?.due_date ? formatDateForDisplay(new Date(task?.due_date)) : 'Not set'}
                        </div>
                      </div>

                      <div className="h-10 w-px bg-neutral-200/70" />

                      <div className="flex-1 space-y-2">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <FolderKanban size={16} />
                          Project
                        </div>
                        <div className={`text-ui-sm text-neutral-900`}>{getProjectName()}</div>
                      </div>
                    </div>

                    {/* Created At Updated At */}
                    <div className="bg-card flex items-center justify-between space-x-4 rounded-2xl p-4 shadow-sm md:p-5">
                      <div className="flex-1 space-y-1">
                        <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                          <CalendarClock size={16} />
                          Created At
                        </div>
                        <div className="text-ui-sm text-neutral-900">
                          {task?.created_at &&
                            new Date(task?.created_at).toLocaleString('en-GB', {
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
                          {task?.updated_at &&
                            new Date(task?.updated_at).toLocaleString('en-GB', {
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
                        className="text-ui-sm w-full flex-1 gap-2 p-2 hover:border-red-300 hover:bg-red-50 hover:text-neutral-700 active:scale-[0.98]"
                      >
                        <Trash2 />
                        Delete Task
                      </Button>
                      <Button
                        onClick={handleEdit}
                        variant={'outline'}
                        size={'lg'}
                        className="text-ui-sm w-full flex-1 gap-2 p-2 hover:border-amber-300 hover:bg-amber-50 hover:text-neutral-700 active:scale-[0.98]"
                      >
                        <SquarePen />
                        Edit Task
                      </Button>
                    </div>
                  </DrawerFooter>
                </>
              ) : (
                /* EDIT MODE */
                <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <div className="h-[calc(100vh-140px)] space-y-4 overflow-y-auto p-4 md:space-y-6 md:p-6 lg:space-y-8 lg:p-8">
                    {/* Server Error */}
                    {serverError && (
                      <Alert variant="destructive">
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Task Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Task Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register('title')}
                        id="title"
                        placeholder="Task title"
                        className={`bg-white ${errors.title ? 'border-red-500' : ''}`}
                        disabled={isSubmitting}
                      />
                      {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        {...register('description')}
                        id="description"
                        placeholder="Task description"
                        rows={8}
                        disabled={isSubmitting}
                        className="bg-white"
                      />
                    </div>

                    {/* Status, Priority & Assigned To */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {/* Status */}
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={selectedStatus || ''}
                          onValueChange={(value) => setValue('status', value as any)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Priority */}
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={selectedPriority || ''}
                          onValueChange={(value) => setValue('priority', value as any)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1 space-y-2">
                        <Label htmlFor="assigned_to">Assign To</Label>
                        <Select
                          value={selectedAssignedTo || ''}
                          onValueChange={(value) => setValue('assigned_to', value === 'none' ? null : value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Assign To */}

                    {/* Due Date */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <div className="relative flex">
                          <Input
                            value={formatDateForDisplay(dueDate)}
                            placeholder="dd/mm/yyyy"
                            disabled={isSubmitting}
                            readOnly
                            className="bg-white"
                          />
                          <input type="hidden" {...register('due_date')} />

                          <Popover open={dueDatePopover} onOpenChange={setDueDatePopover}>
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
                                selected={dueDate}
                                onSelect={handleDueDateSelect}
                                captionLayout="dropdown"
                                disabled={isSubmitting}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DrawerFooter className="border-t">
                    <div className="flex items-center justify-end gap-4">
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
                        className="text-ui-sm focus-visible:ring-offset-background w-full flex-1 border border-blue-600 bg-blue-600 font-medium text-white transition-colors hover:border-blue-700 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] active:border-blue-800 active:bg-blue-800 disabled:cursor-not-allowed disabled:border-blue-500 disabled:bg-blue-500 disabled:text-white/80"
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
