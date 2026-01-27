// import { Settings2, ListTodo } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarRail,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
} from '@/components/ui/sidebar'
import { NavLink } from 'react-router-dom'
import { menuItems } from '@/config/menu.config'

// import { LeftNav } from '@/components/layout/LeftNav'

// This is sample data.
// const data = {
//   navMain: [
//     {
//       title: 'Tasks',
//       url: '#',
//       icon: ListTodo,
//       isActive: true,
//       items: [
//         {
//           title: 'Listing',
//           url: '#',
//         },
//         {
//           title: 'Starred',
//           url: '#',
//         },
//       ],
//     },

//     {
//       title: 'Settings',
//       url: '/settings',
//       icon: Settings2,
//     },
//   ],
// }
export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* <SidebarHeader>
      </SidebarHeader> */}
      <SidebarContent className="bg-white">
        {/* <LeftNav items={data.navMain} /> */}
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              return (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) => (isActive ? '[&>*]:bg-sidebar-accent font-medium' : '')}
                  >
                    <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </NavLink>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
