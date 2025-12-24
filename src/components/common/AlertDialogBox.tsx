import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '../ui/button'

type AlertDialogBoxProps = {
  open: boolean
  setOpen: (value: boolean) => void
  title?: string
  description: string
  handleConfirm: (id?: string) => Promise<void>
}

export const AlertDialogBox = ({
  open,
  setOpen,
  title = 'Are you absolutely sure?',
  description,
  handleConfirm,
}: AlertDialogBoxProps) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <Button onClick={() => handleConfirm()} variant="destructive" className="bg-red-500 hover:bg-red-600">
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
