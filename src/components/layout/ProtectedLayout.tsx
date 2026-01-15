import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { AppSidebar } from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { GlobalModal } from '@/components/layout/GlobalModal'

export const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="min-h-screen bg-neutral-100 p-6 max-md:p-6">{children}</div>
      </SidebarInset>
      <Toaster position="top-right" closeButton={true} dir="ltr" duration={5000} className="toast" />
      <GlobalModal />
    </SidebarProvider>
  )
}
