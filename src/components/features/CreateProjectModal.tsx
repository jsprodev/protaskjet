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
      <DrawerContent className="w-full! bg-neutral-100 md:max-w-[60%]! lg:max-w-[50%]!">
        <DrawerHeader className="border-b p-3">
          <div className="flex items-center justify-between">
            <DrawerTitle>Create New Project</DrawerTitle>
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
        <CreateProjectForm />
      </DrawerContent>
    </Drawer>
  )
}
