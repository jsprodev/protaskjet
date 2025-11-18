import { CreateProjectForm } from '@/components/features/CreateProjectForm'

export const CreateProjectPage = () => {
  return (
    <div className="container max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        {/* <Link to="/projects" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link> */}
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="mt-2 text-gray-600">Fill in the details to create a new project</p>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <CreateProjectForm />
      </div>
    </div>
  )
}
