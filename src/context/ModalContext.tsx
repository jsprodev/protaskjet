import { createContext, useContext, useState, type ReactNode } from 'react'

type ModalType = 'createProject' | 'createTask' | 'createUser' | null

type ModalContextType = {
  activeModal: ModalType
  openCreateProject: () => void
  openCreateTask: () => void
  openCreateUser: () => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const openCreateProject = () => setActiveModal('createProject')
  const openCreateTask = () => setActiveModal('createTask')
  const openCreateUser = () => setActiveModal('createUser')
  const closeModal = () => setActiveModal(null)

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        openCreateProject,
        openCreateTask,
        openCreateUser,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}
