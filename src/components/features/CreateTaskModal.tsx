import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { CreateTaskForm } from './CreateTaskForm'

type CreateTaskModalProps = {
  open: boolean
  onClose: () => void
}

export const CreateTaskModal = ({ open, onClose }: CreateTaskModalProps) => {
  return (
    <Drawer direction="right" open={open} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="w-full! bg-neutral-50 md:max-w-[60%]! lg:max-w-[40%]!">
        <DrawerHeader className="border-b p-3">
          <div className="flex items-center justify-between">
            <DrawerTitle>Create New Task</DrawerTitle>
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
        <div className="max-h-screen overflow-y-auto p-7">
          <CreateTaskForm />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
