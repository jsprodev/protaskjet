import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { CreateProjectForm } from '@/components/features/CreateProjectForm'

type CreateProjectModalProps = {
  open: boolean
  onClose: () => void
}

export const CreateProjectModal = ({ open, onClose }: CreateProjectModalProps) => {
  return (
    <Drawer direction="right" open={open} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="md:max-w-[60%]! lg:max-w-[40%]!">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle>Create New Project</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-4">
          <CreateProjectForm onSuccess={onClose} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
