import { FolderKanban } from 'lucide-react'

export const TotalProjects = () => {
  return (
    <div className="flex flex-1 flex-col rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/10">
      <div className="flex flex-col items-center justify-center">
        <div>
          <FolderKanban className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <div className="my-2">
            <h2 className="text-4xl font-bold text-gray-600">
              <span>2680</span>
            </h2>
          </div>
          <div>
            <p className="mt-2 font-sans text-base font-medium text-gray-500">Projects</p>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  )
}
