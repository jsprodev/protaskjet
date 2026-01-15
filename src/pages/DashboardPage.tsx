import { ProjectsOverviewByStatus } from '../components/charts/ProjectsOverviewByStatus'
import { TasksOverviewByStatus } from '@/components/charts/TasksOverviewByStatus'
import { TotalProjects } from '@/components/charts/TotalProjects'

export const DashboardPage = () => {
  return (
    <div className="flex flex-row flex-wrap gap-8">
      <div className="flex w-full flex-wrap gap-8">
        <TotalProjects />
        <TotalProjects />
        <TotalProjects />
      </div>
      <div className="flex flex-1 flex-wrap gap-8">
        <div className="flex-1">
          <ProjectsOverviewByStatus />
        </div>
        <div className="flex-1">
          <TasksOverviewByStatus />
        </div>
      </div>
    </div>
  )
}
