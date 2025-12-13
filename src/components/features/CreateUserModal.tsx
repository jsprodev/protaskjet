import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { CreateUserForm } from './CreateUserForm'

type CreateUserModalProps = {
  open: boolean
  onClose: () => void
}

export const CreateUserModal = ({ open, onClose }: CreateUserModalProps) => {
  return (
    <Drawer direction="right" open={open} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="md:max-w-[60%]! lg:max-w-[40%]!">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle>Create New User</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-4">
          <CreateUserForm />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
