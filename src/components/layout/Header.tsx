import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { LogOut } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AddDropDownMenu } from '../features/AddDropDownMenu'

export const Header = () => {
  const { session, logout } = useAuth()
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12s flex h-16 shrink-0 items-center gap-2 border-b bg-white transition-[width,height] ease-linear">
      <nav className="flex w-full items-center gap-2 px-4">
        <div className="flex flex-3/4 items-center">
          <SidebarTrigger className="p-4" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-6" />
          <AddDropDownMenu />
        </div>
        <div className="flex items-center justify-end">
          {session && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </nav>
    </header>
  )
}
