import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Plus, FolderKanban, Calendar, BookOpenText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { projectsApi } from '@/services/api/projects.api'
import type { Project } from '@/types/database.types'
import { Field, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { Loader } from '@/components/ui/loader'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="container">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="mt-1 text-gray-600">Manage your projects</p>
        </div>
        <Button asChild className="bg-blue-500 text-white hover:bg-blue-600">
          <Link to="/projects/new">
            <Plus className="size-4" strokeWidth="2.5" />
            New Project
          </Link>
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
        <div className="rounded-lg border bg-gray-50 py-12 text-center">
          <FolderKanban className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
          <p className="mb-4 text-gray-600">Get started by creating your first project</p>
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
            <p className={`text-sm ${project.description ? 'text-foreground line-clamp-3' : 'text-muted-foreground'} `}>
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
            <div className="absolute right-4 bottom-4 flex">
              <Link to={`/projects/${project.id}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={'outline'}
                      size={'icon'}
                      className="cursor-pointer transition-shadow hover:shadow-sm"
                    >
                      <BookOpenText />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View project details</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            </div>
          </div>
        ))}
      </div>
      <Outlet />
    </div>
  )
}

export default ProjectsPage
