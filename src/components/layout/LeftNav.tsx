import { Rocket, ChevronRight, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { NavLink, useLocation } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'

export const LeftNav = ({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) => {
  const location = useLocation()
  const isActive = location.pathname === '/dashboard'

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>AI Dashboard</SidebarGroupLabel> */}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={'Dashboard'}>
            <NavLink to="/dashboard" className={` ${isActive ? 'bg-sidebar-accent font-medium' : ''}`}>
              <Rocket />
              Dashboard
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {items.map((item) => (
          <Fragment key={item.title}>
            {item.items ? (
              <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} data-target={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            {/* <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a> */}
                            <NavLink to={subItem.url}>
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem>
                <NavLink
                  to={item.url}
                  className={({ isActive }) => (isActive ? '[&>*]:bg-sidebar-accent font-medium' : '')}
                >
                  <SidebarMenuButton tooltip={item.title} data-target={item.url}>
                    {item.icon && <item.icon size={30} />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuItem>
            )}
          </Fragment>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
