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
      <DrawerContent className="w-full! bg-neutral-50 md:max-w-[60%]! lg:max-w-[50%]!">
        <DrawerHeader className="border-b p-3">
          <div className="flex items-center justify-between">
            <DrawerTitle>Create New User</DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-neutral-200 hover:text-neutral-900"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <CreateUserForm />
      </DrawerContent>
    </Drawer>
  )
}
