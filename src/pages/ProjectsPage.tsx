import { Link, Outlet } from 'react-router-dom'
import { Plus, FolderKanban, Calendar, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader } from '@/components/ui/loader'
import { useProjects } from '@/context/ProjectsContext'
import { useModal } from '@/context/ModalContext'
import { AlertDialogBox } from '@/components/common/AlertDialogBox'
import { useState } from 'react'
import { toast } from 'sonner'
import { projectsApi } from '@/services/api/projects.api'
import { useTasks } from '@/context/TasksContext'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export const ProjectsPage = () => {
  const { openCreateProject } = useModal()
  const { projects, loading, error, deleteProject } = useProjects()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
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
      console.error(err)
    }
  }

  if (loading) return <Loader />

  return (
    <>
      <AlertDialogBox
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        handleConfirm={handleDeleteProject}
        description="This action cannot be undone. This will permanently delete your project and associated tasks."
      />

      <div className="flex flex-col gap-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-ui-xl font-semibold text-neutral-900">Projects</h1>
            <p className="text-ui-sm text-neutral-500">Manage your projects</p>
          </div>

          <Button
            onClick={openCreateProject}
            className="text-ui-sm focus-visible:ring-offset-background rounded-lg border border-blue-600 bg-blue-600 text-white transition-colors hover:border-blue-500 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-98 active:border-blue-500 active:bg-blue-500 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300 disabled:text-white/80"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            New Project
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-ui-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="mt-8 flex">
            <div className="bg-muted m-auto flex max-w-md flex-col items-center rounded-xl border p-8 text-center">
              <FolderKanban className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-ui-md font-semibold">No Projects Yet</h3>
              <p className="text-ui-sm text-neutral-600">
                You haven’t created any projects yet. Get started by creating your first project.
              </p>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="density-compact grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color] duration-200 hover:border-neutral-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
            >
              {/* Accent Bar */}
              <div
                className="h-0.5"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--status-${project.status}) 100%, white)`,
                }}
              />

              {/* Header */}
              <div
                className="flex items-center justify-between border-b border-neutral-100"
                style={{
                  paddingInline: 'var(--space-card-x)',
                  paddingBlock: 'var(--space-card-y)',
                  gap: 'var(--space-section-gap)',
                }}
              >
                <h2 className="text-ui-md min-w-0 truncate font-medium text-neutral-900">{project.name}</h2>

                <div
                  className="flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap uppercase"
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--status-${project.status}) 12%, white)`,
                    color: `var(--status-${project.status})`,
                  }}
                >
                  <span
                    className="size-1 rounded-full"
                    style={{ backgroundColor: `var(--status-${project.status})` }}
                  />
                  {project.status}
                </div>
              </div>

              {/* Content */}
              <div
                className="flex flex-col"
                style={{
                  paddingInline: 'var(--space-card-x)',
                  paddingBlock: 'var(--space-card-y)',
                  gap: 'var(--space-section-gap)',
                }}
              >
                <p
                  className={`text-ui-sm min-h-[5.2rem] ${
                    project.description ? 'line-clamp-4 text-neutral-600' : 'text-neutral-400 italic'
                  }`}
                >
                  {project.description || 'No description provided'}
                </p>

                {/* Dates */}
                <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-2.5">
                  <div className="space-y-1">
                    <div className="text-ui-xs flex items-center gap-1.5 font-medium text-neutral-500 uppercase">
                      <Calendar size={13} />
                      Start
                    </div>
                    <div
                      className={`text-ui-sm ${project.start_date ? 'text-neutral-900' : 'text-neutral-400 italic'}`}
                    >
                      {project.start_date
                        ? new Date(project.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Not set'}
                    </div>
                  </div>

                  <div className="h-8 w-px bg-neutral-200/70" />

                  <div className="space-y-1 text-right">
                    <div className="text-ui-xs flex items-center justify-end gap-1.5 font-medium text-neutral-500 uppercase">
                      <Calendar size={13} />
                      End
                    </div>
                    <div className={`text-ui-sm ${project.end_date ? 'text-neutral-900' : 'text-neutral-400 italic'}`}>
                      {project.end_date
                        ? new Date(project.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Not set'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                className="mt-auto flex gap-2 border-t border-neutral-100"
                style={{
                  paddingBlock: 'var(--space-card-y)',
                  paddingInline: 'var(--space-card-x)',
                }}
              >
                <Link to={`/projects/${project.id}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-ui-sm w-full gap-2 rounded-lg hover:border-blue-300 hover:bg-blue-50 active:scale-95"
                    style={{ paddingBlock: 'var(--space-button-y)' }}
                  >
                    <Eye size={15} />
                    View Details
                  </Button>
                </Link>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/projects/${project.id}`} state={{ directEditProject: true }}>
                      <Button
                        asChild
                        variant="outline"
                        size="icon-sm"
                        className="rounded-lg hover:border-amber-300 hover:bg-amber-50 hover:text-neutral-700 active:scale-95"
                        style={{ paddingBlock: 'var(--space-button-y)' }}
                      >
                        <span>
                          <Pencil size={15} />
                        </span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="text-ui-xs text-white">Edit task</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-lg hover:border-red-300 hover:bg-red-50 hover:text-neutral-700 active:scale-95"
                      style={{ paddingBlock: 'var(--space-button-y)' }}
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-ui-xs text-white">Delete task permanently</TooltipContent>
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
