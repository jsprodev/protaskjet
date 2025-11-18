import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { AppSidebar } from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="p-5">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
