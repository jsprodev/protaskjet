import { useModal } from '@/context/ModalContext'
import { CreateProjectModal } from '../features/CreateProjectModal'
import { CreateTaskModal } from '../features/CreateTaskModal'
import { CreateUserModal } from '../features/CreateUserModal'

export function GlobalModal() {
  const { activeModal, closeModal } = useModal()

  return (
    <>
      <CreateProjectModal open={activeModal === 'createProject'} onClose={closeModal} />
      <CreateTaskModal open={activeModal === 'createTask'} onClose={closeModal} />
      <CreateUserModal open={activeModal === 'createUser'} onClose={closeModal} />
    </>
  )
}
