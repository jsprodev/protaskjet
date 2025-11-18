import type { ReactNode } from 'react'

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">{children}</div>
    </div>
  )
}
