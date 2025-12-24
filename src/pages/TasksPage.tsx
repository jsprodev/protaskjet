import { useState, useMemo } from 'react'
import { ChevronsUpDown, Trash2, Pencil, Plus, Eye, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from '@/context/TasksContext'
import { Loader } from '@/components/ui/loader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { tasksApi } from '@/services/api/tasks.api'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link, Outlet } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useModal } from '@/context/ModalContext'
import type { TaskWithDetails } from '@/types/database.types'
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
import { AlertDialogBox } from '@/components/common/AlertDialogBox'

// Custom global filter function
const fuzzyFilter: FilterFn<TaskWithDetails> = (row, _columnId, value) => {
  // const itemRank = row.getValue(columnId)
  // Search through all relevant fields
  const searchableText = [
    row.original.title,
    row.original.description,
    (() => {
      const projects = row.original.projects as any
      return Array.isArray(projects) ? projects[0]?.name : projects?.name
    })(),
    (() => {
      const users = row.original.users as any
      return Array.isArray(users) ? users[0]?.name : users?.name
    })(),
    // row.original.status,
    // row.original.priority,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return searchableText.includes(String(value).toLowerCase())
}

export const TasksPage = () => {
  const { tasks, loading, deleteTask } = useTasks()
  const { openCreateTask } = useModal()

  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)

  // react table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)

  const handleDelete = (taskId: string) => {
    setDeleteTaskId(taskId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTask = async () => {
    // if (!confirm('Are you sure you want to delete this task?')) return
    if (!deleteTaskId) return
    setDeleteDialogOpen(false)
    try {
      await tasksApi.delete(deleteTaskId)
      deleteTask(deleteTaskId)
      toast.success('Task deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete task')
      console.error('Error deleting task:', err)
    }
  }

  const columns: ColumnDef<TaskWithDetails>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => {
          return (
            <div className="flex items-center gap-2">
              <span>Title</span>
              <Button
                className="-ml-3 hover:bg-transparent"
                variant="ghost"
                size={'icon-sm'}
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => <div>{row.getValue('title')}</div>,
      },
      {
        accessorKey: 'description',
        header: ({ column }) => {
          return (
            <div className="flex items-center gap-2">
              <span>Description</span>
              <Button
                className="-ml-3 hover:bg-transparent"
                variant="ghost"
                size={'icon-sm'}
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const desc = row.getValue('description') as string
          return <div className="max-w-48 truncate">{desc || 'N/A'}</div>
        },
      },
      {
        id: 'projectName',
        accessorFn: (row) => {
          const project = row.projects as any
          return Array.isArray(project) ? project[0]?.name : project?.name
        },
        header: ({ column }) => {
          return (
            <div className="flex items-center gap-2">
              <span>Project Name</span>
              <Button
                className="-ml-3 hover:bg-transparent"
                variant="ghost"
                size={'icon-sm'}
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const project = row.original.projects as any
          const projectName = Array.isArray(project) ? project[0]?.name : project?.name
          return <div className="text-sm">{projectName || 'N/A'}</div>
        },
      },
      {
        accessorKey: 'priority',
        header: ({ column }) => {
          return (
            <div className="flex items-center gap-2">
              <span>Priority</span>
              <Button
                className="-ml-3 hover:bg-transparent"
                variant="ghost"
                size={'icon-sm'}
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const priority = row.getValue('priority') as string
          const priorityColors: Record<string, string> = {
            urgent: 'bg-gray-400 text-gray-900',
            high: 'bg-gray-300 text-gray-700',
            medium: 'bg-gray-200 text-gray-700',
            low: 'bg-gray-100 text-gray-700',
          }
          return (
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${priorityColors[priority] || 'bg-gray-100'}`}
            >
              {priority}
            </span>
          )
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => {
          return (
            <div className="flex items-center gap-2">
              <span>Status</span>
              <Button
                className="-ml-3 hover:bg-transparent"
                variant="ghost"
                size={'icon-sm'}
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          const statusColors: Record<string, string> = {
            todo: 'bg-gray-100 text-gray-700',
            'in-progress': 'bg-blue-100 text-blue-700',
            review: 'bg-purple-100 text-purple-800',
            done: 'bg-green-100 text-green-700',
            blocked: 'bg-red-100 text-red-700',
          }
          return (
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}
            >
              {status.replace('-', ' ')}
            </span>
          )
        },
      },
      {
        id: 'assignedTo',
        accessorFn: (row) => {
          const user = row.users as any
          return Array.isArray(user) ? user[0]?.name : user?.name
        },
        header: ({ column }) => {
          return (
            <div className="flex items-center gap-2">
              <span>Assigned To</span>
              <Button
                className="-ml-3 hover:bg-transparent"
                variant="ghost"
                size={'icon-sm'}
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              >
                <ChevronsUpDown />
              </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const user = row.original.users as any
          const assignedUser = Array.isArray(user) ? user[0]?.name : user?.name
          return <div className="text-sm">{assignedUser}</div>
        },
      },
      {
        accessorKey: 'due_date',
        header: 'Due Date',
        cell: ({ row }) => {
          const date = row.getValue('due_date') as string
          // if (!date) return <div className="text-sm text-gray-500">No due date</div>
          return <div className="text-sm">{date ? new Date(date).toLocaleDateString() : ''}</div>
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const task = row.original
          return (
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/tasks/${task.id}`}>
                    <Button
                      variant={'outline'}
                      size={'icon-sm'}
                      className="cursor-pointer transition-shadow hover:shadow-sm"
                    >
                      <Eye />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View task details</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/tasks/${task.id}`} state={{ directEditTask: true }}>
                    <Button
                      variant={'outline'}
                      size={'icon-sm'}
                      className="cursor-pointer transition-shadow hover:shadow-sm"
                    >
                      <Pencil />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit task</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size={'icon-sm'} className="h-8 w-8" onClick={() => handleDelete(task.id)}>
                    <Trash2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete task</TooltipContent>
              </Tooltip>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: tasks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy', // Use custom filter
    filterFns: {
      fuzzy: fuzzyFilter, // Register custom filter
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  if (loading) {
    return <Loader />
  }

  const onSearch = (value: string) => {
    // const value = e.target.value
    setGlobalFilter(value)
  }

  const onStatusChange = (value: string) => {
    table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
  }

  const onPriorityChange = (value: string) => {
    table.getColumn('priority')?.setFilterValue(value === 'all' ? '' : value)
  }

  const handleReset = () => {
    onStatusChange('all')
    onPriorityChange('all')
    onSearch('')
  }

  return (
    <>
      <AlertDialogBox
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        handleConfirm={handleDeleteTask}
        description="This action cannot be undone. This will permanently delete your task"
      />
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold max-md:text-xl">Tasks</h1>
            <p className="text-gray-600">Manage your tasks</p>
          </div>
          <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={openCreateTask}>
            <Plus className="size-4" strokeWidth="2.5" /> New Task
          </Button>
        </div>

        {tasks.length ? (
          <>
            <div className="flex gap-4">
              <Field className="gap-1">
                <FieldLabel>Search:</FieldLabel>
                <Input
                  placeholder="title, description, project, assigned to"
                  value={globalFilter}
                  onChange={(e) => onSearch(e.target.value)}
                  className=""
                />
              </Field>
              <Field className="gap-1 max-md:hidden">
                <FieldLabel>Filter by Priority:</FieldLabel>
                <Select onValueChange={onPriorityChange} defaultValue="all">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="gap-1 max-md:hidden">
                <FieldLabel>Filter by Status:</FieldLabel>
                <Select onValueChange={onStatusChange} defaultValue="all">
                  <SelectTrigger className="">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="max-w-[100px] gap-1">
                <FieldLabel className="invisible">reset filters</FieldLabel>
                <Button variant={'outline'} size={'default'} onClick={handleReset}>
                  Reset Filters
                </Button>
              </Field>
            </div>

            <div className="w-full overflow-x-auto rounded-md border">
              <Table className="table-auto">
                <TableHeader className="bg-accent">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="text-muted-foreground p-2">
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
                      <TableCell colSpan={8} className="text-center">
                        no record found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-8 flex">
            <div className="bg-muted m-auto flex w-3xl flex-col items-center justify-center rounded-xl border p-8 text-center">
              <CheckSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No Tasks Yet</h3>
              <p className="mb-4 text-gray-600">
                You haven't created any tasks yet. Get started by creating your first task.
              </p>
            </div>
          </div>
        )}

        <Outlet />
      </div>
    </>
  )
}
