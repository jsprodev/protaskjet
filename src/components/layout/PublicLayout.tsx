import type { ReactNode } from 'react'

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <div className="w-full">{children}</div>
    </div>
  )
}
