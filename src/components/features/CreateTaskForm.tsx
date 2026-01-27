import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { Loader2, AlertCircleIcon, CalendarIcon, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { createTaskSchema, type CreateTaskInput } from '@/schemas/task.schema'
import { tasksApi } from '@/services/api/tasks.api'
import { usersApi } from '@/services/api/users.api'
import { projectsApi } from '@/services/api/projects.api'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useModal } from '@/context/ModalContext'
import { useTasks } from '@/context/TasksContext'
import { DrawerFooter } from '../ui/drawer'

// type CreateTaskFormProps = {
//   onSuccess?: () => void
// }

export const CreateTaskForm = () => {
  const [openDueDate, setOpenDueDate] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [serverError, setServerError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [projectSearch, setProjectSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [openProjectSelect, setOpenProjectSelect] = useState(false)
  const { closeModal } = useModal()
  const { addTask, loadTasks } = useTasks()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      project_id: '',
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigned_to: null,
      due_date: '',
    },
  })

  const selectedProjectId = watch('project_id')

  // Load projects and users on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingProjects(true)
        const projectsData = await projectsApi.getAll()
        setProjects(projectsData)
        setFilteredProjects(projectsData)
      } catch (error) {
        console.error('Failed to load projects:', error)
        toast.error('Failed to load projects')
      } finally {
        setLoadingProjects(false)
      }

      try {
        setLoadingUsers(true)
        const usersData = await usersApi.getAll()
        setUsers(usersData)
      } catch (error) {
        console.error('Failed to load users:', error)
        toast.error('Failed to load users')
      } finally {
        setLoadingUsers(false)
      }
    }

    loadData()
  }, [])

  // Filter projects based on search
  useEffect(() => {
    if (!projectSearch.trim()) {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter((project) => project.name.toLowerCase().includes(projectSearch.toLowerCase()))
      setFilteredProjects(filtered)
    }
  }, [projectSearch, projects])

  const onSubmit = async (data: CreateTaskInput) => {
    setServerError(null)
    try {
      const task = await tasksApi.create(data)
      addTask(task)
      loadTasks()
      reset()
      toast.success('Task created successfully!')
      closeModal()
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to create task')
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
    setOpenDueDate(false)
  }

  const handleProjectSelect = (projectId: string) => {
    setValue('project_id', projectId)
    setOpenProjectSelect(false)
    setProjectSearch('')
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

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

        {/* Project Selection with Search */}
        <div className="space-y-2">
          <Label htmlFor="project_id" className="text-ui-xs font-medium text-neutral-500">
            Project <span className="text-red-500">*</span>
          </Label>
          <Popover open={openProjectSelect} onOpenChange={setOpenProjectSelect}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={`w-full justify-start text-left ${!selectedProjectId ? 'text-muted-foreground' : ''} ${
                  errors.project_id ? 'border-red-500' : ''
                }`}
                disabled={isSubmitting || loadingProjects}
              >
                {loadingProjects ? 'Loading projects...' : selectedProject?.name || 'Select a project...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <div className="border-b p-3">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="pl-8"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {filteredProjects.length === 0 ? (
                  <div className="text-muted-foreground p-3 text-center text-sm">
                    No projects found. Create a project first then add task
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredProjects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => handleProjectSelect(project.id)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          selectedProjectId === project.id
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="font-medium">{project.name}</div>
                        <div className="text-muted-foreground line-clamp-1 text-xs">
                          {project.description || 'No description'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {errors.project_id && <p className="text-sm text-red-500">{errors.project_id.message}</p>}
        </div>

        {/* Task Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-ui-xs font-medium text-neutral-500">
            Task Title <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register('title')}
            id="title"
            placeholder="e.g., Design homepage mockup"
            className={`bg-white ${errors.title ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-ui-xs font-medium text-neutral-500">
            Description
          </Label>
          <Textarea
            {...register('description')}
            id="description"
            placeholder="Describe the task..."
            rows={8}
            disabled={isSubmitting}
            className="bg-white"
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        {/* Status, Priority & Assigned To */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-ui-xs font-medium text-neutral-500">
              Status
            </Label>
            <Select
              defaultValue="todo"
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
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-ui-xs font-medium text-neutral-500">
              Priority
            </Label>
            <Select
              defaultValue="medium"
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
          {/* Assign To */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to" className="text-ui-xs font-medium text-neutral-500">
              Assign To
            </Label>
            <Select
              onValueChange={(value) => setValue('assigned_to', value === 'none' ? null : value)}
              disabled={isSubmitting || loadingUsers}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={loadingUsers ? 'Loading users...' : 'Select user'} />
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

        {/* Due Date */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="due_date" className="text-ui-xs font-medium text-neutral-500">
              Due Date
            </Label>
            <div className="relative flex">
              <Input
                className="bg-white"
                value={formatDateForDisplay(dueDate)}
                placeholder="mm/dd/yyyy"
                disabled={isSubmitting}
                readOnly
              />
              <input type="hidden" {...register('due_date')} />

              <Popover open={openDueDate} onOpenChange={setOpenDueDate}>
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
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </DrawerFooter>
    </form>
  )
}
