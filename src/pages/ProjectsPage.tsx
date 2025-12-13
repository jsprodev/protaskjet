import { Link, Outlet } from 'react-router-dom'
import {
  Plus,
  FolderKanban,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  KanbanIcon,
  KanbanSquareIcon,
  KanbanSquareDashed,
  KanbanSquareDashedIcon,
  LucideKanbanSquareDashed,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Field, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { Loader } from '@/components/ui/loader'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useProjects } from '@/context/ProjectsContext'
import { useModal } from '@/context/ModalContext'
import { AlertDialogBox } from '@/components/common/AlertDialogBox'
import { useState } from 'react'
import { toast } from 'sonner'
import { projectsApi } from '@/services/api/projects.api'
import { useTasks } from '@/context/TasksContext'

export const ProjectsPage = () => {
  const { openCreateProject } = useModal()
  const { projects, loading, error, deleteProject } = useProjects()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)

  const { loadTasks } = useTasks()

  const handleDelete = (projectId: string) => {
    setDeleteProjectId(projectId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return
    setDeleteDialogOpen(false)
    try {
      await projectsApi.delete(deleteProjectId)
      deleteProject(deleteProjectId)
      toast.success('Project deleted successfully!')
      loadTasks()
    } catch (err) {
      toast.error('Failed to delete project')
      console.error('Error deleting project:', err)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <AlertDialogBox
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        handleConfirm={handleDeleteProject}
        description="This action cannot be undone. This will permanently delete your project and associated tasks."
      />
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold max-md:text-xl">Projects</h1>
            <p className="text-gray-600">Manage your projects</p>
          </div>
          <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={openCreateProject}>
            <Plus className="size-4" strokeWidth="2.5" /> New Project
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="mt-8 flex">
            <div className="bg-muted m-auto flex w-3xl flex-col items-center justify-center rounded-xl border p-8 text-center">
              <FolderKanban className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No Projects Yet</h3>
              <p className="mb-4 text-gray-600">
                You haven't created any Projects yet. Get started by creating your first Project.
              </p>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative flex flex-col gap-4 rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-baseline justify-between">
                <h1 className="text-md font-medium">{project.name}</h1>
                <span
                  className={`ml-5 rounded-full px-2 py-1.5 text-xs/2 ${
                    project.status === 'active'
                      ? 'bg-blue-100 text-blue-700'
                      : project.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'on-hold'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p
                className={`text-sm ${project.description ? 'text-foreground line-clamp-3' : 'text-muted-foreground'} `}
              >
                {project.description || 'no description'}
              </p>

              <div className="text-muted-foreground mb-12 flex">
                <Field>
                  <FieldSet>
                    <FieldLegend className="mb-2 flex items-center text-xs!">
                      <Calendar size={16} className="mr-1" />
                      Start Date
                    </FieldLegend>
                    <FieldDescription className={`${project.start_date ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'no start date'}
                    </FieldDescription>
                  </FieldSet>
                </Field>
                <Field>
                  <FieldSet>
                    <FieldLegend className="mb-2 flex items-center text-xs!">
                      <Calendar size={16} className="mr-1" />
                      End Date
                    </FieldLegend>
                    <FieldDescription className={`${project.end_date ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'no end date'}
                    </FieldDescription>
                  </FieldSet>
                </Field>
              </div>
              <div className="absolute right-4 bottom-4 flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/projects/${project.id}`}>
                      <Button
                        variant={'outline'}
                        size={'icon-sm'}
                        className="cursor-pointer transition-shadow hover:shadow-sm"
                      >
                        <Eye />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View project details</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/projects/${project.id}`} state={{ directEditProject: true }}>
                      <Button
                        variant={'outline'}
                        size={'icon-sm'}
                        className="cursor-pointer transition-shadow hover:shadow-sm"
                      >
                        <Pencil />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit project</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={'outline'}
                      size={'icon-sm'}
                      className="cursor-pointer transition-shadow hover:shadow-sm"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete project</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
        <Outlet />
      </div>
    </>
  )
}
