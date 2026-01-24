import { useUsers } from '@/context/UsersContext'
import { Users } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'

export const TotalUsersCard = () => {
  const { users } = useUsers()

  const total = users.length
  const admins = users.filter((u) => u.role === 'admin').length
  const managers = users.filter((u) => u.role === 'manager').length
  const regularUsers = users.filter((u) => u.role === 'user').length

  const adminPercent = total > 0 ? Math.round((admins / total) * 100) : 0
  const managerPercent = total > 0 ? Math.round((managers / total) * 100) : 0
  const userPercent = total > 0 ? Math.round((regularUsers / total) * 100) : 0

  return (
    <MetricCard
      icon={<Users className="size-5" />}
      label="Total Users"
      value={total}
      footer={
        <div className="mt-3 space-y-3">
          {/* Stacked Progress Bar */}
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-100">
            {admins > 0 && (
              <div
                className="h-full bg-slate-500 transition-all duration-500 ease-out"
                style={{ width: `${adminPercent}%` }}
              />
            )}
            {managers > 0 && (
              <div
                className="h-full bg-slate-400 transition-all duration-500 ease-out"
                style={{ width: `${managerPercent}%` }}
              />
            )}
            {regularUsers > 0 && (
              <div
                className="h-full bg-slate-300 transition-all duration-500 ease-out"
                style={{ width: `${userPercent}%` }}
              />
            )}
          </div>

          {/* Role Breakdown */}
          <div className="text-ui-xs flex flex-wrap justify-center gap-2 font-medium">
            {admins > 0 && (
              <div className="flex items-center gap-1.5 text-neutral-600">
                <div className="h-2 w-2 rounded-full bg-slate-500" />
                <span>
                  {admins} Admin{admins !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {managers > 0 && (
              <div className="flex items-center gap-1.5 text-neutral-600">
                <div className="h-2 w-2 rounded-full bg-slate-400" />
                <span>
                  {managers} Manager{managers !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {regularUsers > 0 && (
              <div className="flex items-center gap-1.5 text-neutral-600">
                <div className="h-2 w-2 rounded-full bg-slate-300" />
                <span>
                  {regularUsers} User{regularUsers !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      }
    />
  )
}
