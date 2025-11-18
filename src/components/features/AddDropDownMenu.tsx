import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { PlusSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { menuItems } from '@/config/menu.config'

export const AddDropDownMenu = () => {
  const dropdownMenuItems = menuItems.filter((i) => i.createUrl)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="font-normal">
          <PlusSquare />
          Add New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto" align="start">
        {dropdownMenuItems.map((item, i) => (
          <Link to={item.createUrl as string} key={i}>
            <DropdownMenuItem>
              <item.icon className="text-primary" />
              {item.title}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
