import { useState, useMemo } from 'react'
import { ChevronsUpDown, Trash2, Pencil, Plus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { usersApi } from '@/services/api/users.api'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link, Outlet } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AlertDialogBox } from '@/components/common/AlertDialogBox'
import type { User } from '@/types/database.types'
import { useUsers } from '@/context/UsersContext'
import { useModal } from '@/context/ModalContext'
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type FilterFn,
} from '@tanstack/react-table'

const fuzzyFilter: FilterFn<User> = (row, _columnId, value) => {
  const searchableText = [row.original.name, row.original.email, row.original.role]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return searchableText.includes(String(value).toLowerCase())
}

export const UsersPage = () => {
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const { users, loading, deleteUser } = useUsers()
  const { openCreateUser } = useModal()

  const handleDelete = (userId: string) => {
    setDeleteUserId(userId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!deleteUserId) return
    setDeleteDialogOpen(false)
    try {
      await usersApi.delete(deleteUserId)
      deleteUser(deleteUserId)
      toast.success('User deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete user')
      console.error('Error deleting user:', err)
    }
  }

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <div className="flex items-center">
              <span className="text-ui-xs font-medium text-neutral-500 uppercase">Name</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown className="size-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name}
                alt={user.name}
                className="size-10 rounded-full object-cover"
              />
              <span className="text-ui-sm font-medium text-neutral-900">{row.getValue('name')}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'email',
        header: ({ column }) => {
          return (
            <div className="flex items-center">
              <span className="text-ui-xs font-medium text-neutral-500 uppercase">Email</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown className="size-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => <div className="text-ui-sm font-medium text-neutral-700">{row.getValue('email')}</div>,
      },
      {
        accessorKey: 'role',
        header: ({ column }) => {
          return (
            <div className="flex items-center">
              <span className="text-ui-xs font-medium text-neutral-500 uppercase">Role</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown className="size-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => (
          <span className="rounded-md border px-2 py-1 text-[11px] font-medium text-neutral-600 uppercase">
            {row.getValue('role')}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => {
          return (
            <div className="flex items-center">
              <span className="text-ui-xs font-medium text-neutral-500 uppercase">Created At</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-transparent"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown className="size-4" />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <div className="text-ui-sm font-medium text-neutral-500">{new Date(date).toLocaleDateString()}</div>
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-ui-xs text-right font-medium text-neutral-500 uppercase">Actions</div>,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center justify-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/users/${user.id}`}>
                    <Button
                      variant="outline"
                      size={'icon-sm'}
                      className="hover:border-blue-300 hover:bg-blue-50 active:scale-95"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>View user details</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/users/${user.id}`} state={{ directEditUser: true }}>
                    <Button
                      variant="outline"
                      size={'icon-sm'}
                      className="hover:border-amber-300 hover:bg-amber-50 hover:text-neutral-700 active:scale-95"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Edit user</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size={'icon-sm'}
                    className="hover:border-red-300 hover:bg-red-50 hover:text-neutral-700 active:scale-95"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete user permanently</TooltipContent>
              </Tooltip>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy',
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    enableColumnResizing: false,
    columnResizeMode: 'onChange',
  })

  const onSearch = (value: string) => {
    setGlobalFilter(value)
  }

  const onRoleChange = (value: string) => {
    table.getColumn('role')?.setFilterValue(value === 'all' ? '' : value)
  }

  const handleReset = () => {
    onRoleChange('all')
    onSearch('')
  }

  // const loadUsers = async () => {
  //   setLoading(true)
  //   try {
  //     const data = await usersApi.getAll()
  //     setUsers(data)
  //   } catch (err) {
  //     toast.error('Failed to load users')
  //     console.error('Error loading users:', err)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // useState(() => {
  //   loadUsers()
  // }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <AlertDialogBox
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        handleConfirm={handleDeleteUser}
        description="This action cannot be undone. This will permanently delete the user."
      />
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-ui-xl font-semibold text-neutral-900">Users</h1>
            <p className="text-ui-sm text-neutral-500">Manage team members</p>
          </div>
          <Button
            onClick={openCreateUser}
            className="text-ui-sm focus-visible:ring-offset-background rounded-lg border border-blue-600 bg-blue-600 text-white transition-colors hover:border-blue-500 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-98 active:border-blue-500 active:bg-blue-500 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300 disabled:text-white/80"
          >
            <Plus className="mr-1 h-4 w-4" />
            New User
          </Button>
        </div>

        {users.length ? (
          <div className="flex flex-col gap-8">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:p-5">
              <div className="flex flex-wrap gap-4">
                <Field className="min-w-[220px] flex-1 gap-1">
                  <FieldLabel>Search:</FieldLabel>
                  <Input
                    placeholder="name, email, role"
                    value={globalFilter}
                    onChange={(e) => onSearch(e.target.value)}
                    className="bg-white"
                  />
                </Field>
                <Field className="w-[160px] gap-1">
                  <FieldLabel>Filter by Role:</FieldLabel>
                  <Select onValueChange={onRoleChange} defaultValue="all">
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="w-[160px] gap-1">
                  <FieldLabel className="invisible">reset filters</FieldLabel>
                  <Button
                    variant={'outline'}
                    size={'default'}
                    onClick={handleReset}
                    className="text-ui-sm font-normal hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 active:scale-[0.98]"
                  >
                    Reset Filters
                  </Button>
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                <Table className="table-fixed">
                  <TableHeader className="bg-neutral-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} className="px-4 py-3">
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center">
                          no record found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="text-ui-sm text-neutral-600">
                  Showing{' '}
                  {table.getRowModel().rows.length > 0
                    ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
                    : 0}{' '}
                  to{' '}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{' '}
                  of {table.getFilteredRowModel().rows.length} records
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-ui-sm text-neutral-600">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="text-ui-sm font-normal hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 active:scale-[0.98]"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="text-ui-sm font-normal hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 active:scale-[0.98]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex">
            <div className="bg-muted m-auto flex w-3xl flex-col items-center justify-center rounded-xl border p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">No Users Yet</h3>
              <p className="text-gray-600">Users will appear here once they are created.</p>
            </div>
          </div>
        )}

        <Outlet />
      </div>
    </>
  )
}
