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
  description?: string
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
          <AlertDialogCancel className="text-ui-sm cursor-pointer font-normal text-neutral-700 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-400/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98]">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={() => handleConfirm()}
            variant="destructive"
            className="text-ui-sm border border-red-600 bg-red-600 font-medium text-white transition-colors hover:border-red-700 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] active:border-red-800 active:bg-red-800 disabled:cursor-not-allowed disabled:border-red-500 disabled:bg-red-500 disabled:text-white/80"
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
