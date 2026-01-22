import { useProjects } from '@/context/ProjectsContext'
import { useTasks } from '@/context/TasksContext'
import { TrendingUp } from 'lucide-react'

export const ProjectProgressChart = () => {
  const { projects } = useProjects()
  const { tasks } = useTasks()

  const activeProjects = projects
    .filter((p) => p.status === 'active')
    .map((project) => {
      const projectTasks = tasks.filter((t) => t.project_id === project.id)
      const completedTasks = projectTasks.filter((t) => t.status === 'done').length
      const totalTasks = projectTasks.length
      const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return { ...project, completedTasks, totalTasks, completion }
    })
    .sort((a, b) => b.completion - a.completion)

  const getProgressColor = (percent: number) => {
    // if (percent >= 75) return 'bg-green-500'
    // if (percent >= 50) return 'bg-blue-500'
    // if (percent >= 25) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getProgressBg = (percent: number) => {
    // if (percent >= 75) return 'bg-green-50'
    // if (percent >= 50) return 'bg-blue-50'
    // if (percent >= 25) return 'bg-orange-50'
    return 'bg-green-50'
  }

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-ui-md font-semibold text-neutral-900">Project Progress</h3>
          <p className="text-ui-xs text-neutral-500">Completion status of active projects</p>
        </div>
      </div>

      {/* Projects list */}
      <div className="flex max-h-80 flex-1 flex-col space-y-3 overflow-auto pr-3">
        {activeProjects.length > 0 ? (
          activeProjects.map((project) => (
            <div key={project.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="text-ui-sm truncate font-medium text-neutral-900">{project.name}</h4>
                  <p className="text-ui-xs text-neutral-500">
                    {project.completedTasks} of {project.totalTasks} tasks completed
                  </p>
                </div>
                <div
                  className={`ml-3 flex h-8 w-12 items-center justify-center rounded-lg ${getProgressBg(
                    project.completion
                  )}`}
                >
                  <span className="text-ui-sm font-medium text-neutral-900 tabular-nums">{project.completion}%</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(project.completion)}`}
                  style={{ width: `${project.completion}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <p className="text-ui-sm mt-3 font-medium text-neutral-900">No active projects</p>
            <p className="text-ui-xs text-neutral-500">Create a project to track progress</p>
          </div>
        )}
      </div>
    </div>
  )
}
