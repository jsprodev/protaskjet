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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-700'
    case 'in-progress':
      return 'bg-blue-100 text-blue-700'
    case 'review':
      return 'bg-purple-100 text-purple-700'
    case 'done':
      return 'bg-green-100 text-green-700'
    case 'blocked':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-700'
    case 'high':
      return 'bg-orange-100 text-orange-700'
    case 'medium':
      return 'bg-blue-100 text-blue-700'
    case 'low':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

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
        <DrawerContent className="md:max-w-[60%]! lg:max-w-[40%]!">
          <DrawerHeader className="p-0">
            <div className="bg-accent flex items-center justify-between p-2">
              <DrawerTitle className="text-lg font-semibold">
                {isEditing || directEditTask ? 'Edit Task' : 'Task Details'}
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
              {!isEditing && !directEditTask ? (
                <>
                  <div className="relative h-[calc(100vh-130px)] space-y-5! overflow-y-auto p-4">
                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2">Task Title</FieldLegend>
                        <FieldDescription className="text-foreground flex items-baseline justify-between">
                          {task?.title}
                          <span
                            className={`ml-5 flex rounded-full px-2 py-1.5 text-xs/2 ${getStatusColor(task?.status || '')}`}
                          >
                            {task?.status.replace('-', ' ')}
                          </span>
                        </FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2">Priority</FieldLegend>
                        <FieldDescription className="text-foreground">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityColor(task?.priority || '')}`}
                          >
                            {task?.priority}
                          </span>
                        </FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2">Description</FieldLegend>
                        <FieldDescription
                          className={`${task?.description ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {task?.description || 'No description'}
                        </FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2">Project</FieldLegend>
                        <FieldDescription className="text-foreground">{getProjectName()}</FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2">Assigned To</FieldLegend>
                        <FieldDescription className="text-foreground">{getAssignedUserName()}</FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                          <CalendarIcon size={16} className="mr-1" />
                          Due Date
                        </FieldLegend>
                        <FieldDescription className={`${task?.due_date ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {task?.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </FieldDescription>
                      </FieldSet>
                    </Field>

                    <Field>
                      <FieldSet>
                        <FieldLegend className="text-foreground mb-2 flex items-center text-sm!">
                          <CalendarClock size={16} className="mr-1" />
                          Created At
                        </FieldLegend>
                        <FieldDescription className="text-foreground">
                          {task?.created_at && new Date(task.created_at).toLocaleString()}
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
                          {task?.updated_at && new Date(task.updated_at).toLocaleString()}
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
                        Delete Task
                      </Button>
                      <Button onClick={handleEdit} variant={'outline'} size={'lg'} className="flex-1">
                        <SquarePen />
                        Edit Task
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

                    {/* Task Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Task Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register('title')}
                        id="title"
                        placeholder="Task title"
                        className={errors.title ? 'border-red-500' : ''}
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
                        rows={4}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Status */}
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={selectedStatus || ''}
                          onValueChange={(value) => setValue('status', value as any)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
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
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={selectedPriority || ''}
                          onValueChange={(value) => setValue('priority', value as any)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
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
                    </div>

                    {/* Assign To */}
                    <div className="space-y-2">
                      <Label htmlFor="assigned_to">Assign To</Label>
                      <Select
                        value={selectedAssignedTo || ''}
                        onValueChange={(value) => setValue('assigned_to', value === 'none' ? null : value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
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

                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <div className="relative flex">
                        <Input
                          value={formatDateForDisplay(dueDate)}
                          placeholder="dd/mm/yyyy"
                          disabled={isSubmitting}
                          readOnly
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
