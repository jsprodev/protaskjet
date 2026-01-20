/* eslint-disable react-refresh/only-export-components */
import { createContext, type ReactNode, useState, useEffect, useContext } from 'react'
import { type User } from '@/types/database.types'
import { usersApi } from '@/services/api/users.api'

type UserContextType = {
  users: User[]
  loading: boolean
  error: string | null
  loadUsers: () => Promise<void>
  addUser: (user: User) => void
  updateUser: (user: User) => void
  deleteUser: (userId: string) => void
}

const UserContext = createContext<UserContextType | null>(null)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setErrors] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setErrors(null)
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (err) {
      setErrors(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const addUser = (user: User) => {
    setUsers((prevUsers) => [user, ...prevUsers])
  }

  const updateUser = (user: User) => {
    setUsers((prevUsers) => prevUsers.map((u) => (u.id === user.id ? user : u)))
  }

  const deleteUser = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
  }

  return (
    <UserContext.Provider value={{ users, loading, error, loadUsers, addUser, updateUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUsers = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('users context must be used with in a provider')
  return context
}
