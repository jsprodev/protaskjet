import { useState, useMemo } from 'react'
import {
  ChevronsUpDown,
  Trash2,
  Pencil,
  Plus,
  Eye,
  CheckSquare,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ShieldAlert,
} from 'lucide-react'
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

/* ---------------- FILTER ---------------- */

const fuzzyFilter: FilterFn<TaskWithDetails> = (row, _columnId, value) => {
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
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return searchableText.includes(String(value).toLowerCase())
}

/* ---------------- PAGE ---------------- */

export const TasksPage = () => {
  const { tasks, loading, deleteTask } = useTasks()
  const { openCreateTask } = useModal()

  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const handleDelete = (taskId: string) => {
    setDeleteTaskId(taskId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return
    setDeleteDialogOpen(false)
    try {
      await tasksApi.delete(deleteTaskId)
      deleteTask(deleteTaskId)
      toast.success('Task deleted successfully!')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  /* ---------------- COLUMNS ---------------- */

  const columns: ColumnDef<TaskWithDetails>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        size: 320,
        minSize: 320,
        maxSize: 320,
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span className="text-ui-xs font-medium text-neutral-500 uppercase">Title</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-transparent"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <ChevronsUpDown className="size-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-ui-sm truncate font-medium text-neutral-900">{row.getValue('title')}</div>
        ),
      },
      // {
      //   accessorKey: 'description',
      //   header: ({ column }) => (
      //     <div className="flex items-center gap-1">
      //       <span className="text-ui-xs font-medium text-neutral-500 uppercase">Description</span>
      //       <Button
      //         variant="ghost"
      //         size="icon-sm"
      //         className="hover:bg-transparent"
      //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      //       >
      //         <ChevronsUpDown className="h-3.5 w-3.5" />
      //       </Button>
      //     </div>
      //   ),
      //   cell: ({ row }) => (
      //     <div className="text-ui-sm max-w-64 truncate text-neutral-600">{row.getValue('description') || '—'}</div>
      //   ),
      // },
      {
        id: 'projectName',
        size: 250,
        minSize: 250,
        maxSize: 250,
        accessorFn: (row) => {
          const project = row.projects as any
          return Array.isArray(project) ? project[0]?.name : project?.name
        },
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span className="text-ui-xs font-medium text-neutral-500 uppercase">Project Name</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-transparent"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <ChevronsUpDown className="size-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-ui-sm truncate text-neutral-700">
            {(Array.isArray(row.original.projects) ? row.original.projects[0]?.name : row.original.projects?.name) ||
              '—'}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        size: 100,
        minSize: 100,
        maxSize: 100,
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span className="text-ui-xs font-medium text-neutral-500 uppercase">Status</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-transparent"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <ChevronsUpDown className="size-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase`}
              style={{
                backgroundColor: `color-mix(in oklab, var(--status-${status}) 12%, white)`,
                color: `var(--status-${status})`,
              }}
            >
              {status.replace('-', ' ')}
            </span>
          )
        },
      },
      {
        accessorKey: 'priority',
        size: 100,
        minSize: 100,
        maxSize: 100,
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span className="text-ui-xs font-medium text-neutral-500 uppercase">Priority</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-transparent"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <ChevronsUpDown className="size-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const priority = row.getValue('priority') as string
          let symbol
          switch (priority) {
            case 'low':
              symbol = <ArrowDown className="size-4 text-neutral-500" />
              break
            case 'medium':
              symbol = <ArrowRight className="size-4 text-neutral-500" />
              break
            case 'high':
              symbol = <ArrowUp className="size-4 text-neutral-500" />
              break
            case 'urgent':
              symbol = (
                <>
                  <ShieldAlert className="size-4 text-neutral-500" />
                </>
              )
              break
            default:
              symbol = ' '
          }
          return (
            <div className="text-ui-xs flex-inline flex items-center gap-2 font-medium text-neutral-700">
              {symbol} {priority}
            </div>
          )
        },
      },

      {
        id: 'assignedTo',
        size: 100,
        minSize: 100,
        maxSize: 100,
        accessorFn: (row) => {
          const user = row.users as any
          return Array.isArray(user) ? user[0]?.name : user?.name
        },
        header: ({ column }) => (
          <div className="flex items-center gap-1">
            <span className="text-ui-xs font-medium text-neutral-500 uppercase">Assignee</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-transparent"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <ChevronsUpDown className="size-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const user = row.original.users as any
          const userName = Array.isArray(user) ? user[0]?.name : user?.name
          return (
            <span className="text-ui-xs rounded-full border border-neutral-200 px-2.5 py-1 font-medium text-neutral-700">
              {userName || 'unassigned'}
            </span>
          )
        },
      },
      {
        id: 'actions',
        size: 120,
        minSize: 120,
        maxSize: 120,
        header: () => <div className="text-ui-xs text-right font-medium text-neutral-500 uppercase">Actions</div>,
        cell: ({ row }) => {
          const task = row.original

          return (
            <div className="flex items-center justify-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/tasks/${task.id}`}>
                    <Button
                      variant="outline"
                      size={'icon-sm'}
                      className="hover:border-blue-300 hover:bg-blue-50 active:scale-95"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>View task details</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/tasks/${task.id}`} state={{ directEditTask: true }}>
                    <Button
                      variant="outline"
                      size={'icon-sm'}
                      className="hover:border-amber-300 hover:bg-amber-50 hover:text-neutral-700 active:scale-95"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Edit task</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size={'icon-sm'}
                    className="hover:border-red-300 hover:bg-red-50 hover:text-neutral-700 active:scale-95"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete task permanently</TooltipContent>
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
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: 'fuzzy',
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: false,
    columnResizeMode: 'onChange',
  })

  if (loading) return <Loader />

  return (
    <>
      <AlertDialogBox
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        handleConfirm={handleDeleteTask}
        description="This action cannot be undone. This will permanently delete your task."
      />

      <div className="flex flex-col gap-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-ui-xl font-semibold text-neutral-900">Tasks</h1>
            <p className="text-ui-sm text-neutral-500">Manage your tasks</p>
          </div>

          <Button
            onClick={openCreateTask}
            className="text-ui-sm focus-visible:ring-offset-background border border-blue-600 bg-blue-600 text-white transition-colors hover:border-blue-700 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 active:border-blue-800 active:bg-blue-800 disabled:cursor-not-allowed disabled:border-blue-500 disabled:bg-blue-500 disabled:text-white/80"
          >
            <Plus className="mr-1 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* FILTERS CARD */}

        {/* TABLE */}
        {tasks.length ? (
          <div className="flex flex-col gap-8">
            <div className="rounded-xl border border-neutral-300 bg-neutral-50 p-5">
              <div className="flex flex-wrap gap-4">
                <Field className="min-w-[220px] flex-1 gap-1">
                  <FieldLabel>Search</FieldLabel>
                  <Input
                    placeholder="Title, project, user"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="bg-white"
                  />
                </Field>

                <Field className="w-[160px] gap-1">
                  <FieldLabel>Status</FieldLabel>
                  <Select
                    value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
                    onValueChange={(value) =>
                      table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="todo">Todo</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="w-[160px] gap-1">
                  <FieldLabel>Priority</FieldLabel>
                  <Select
                    value={(table.getColumn('priority')?.getFilterValue() as string) ?? 'all'}
                    onValueChange={(value) =>
                      table.getColumn('priority')?.setFilterValue(value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="All priorities" />
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

                <Field className="w-[160px] gap-1">
                  <FieldLabel className="invisible">Reset</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-ui-sm bg-white font-normal hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-700 active:scale-[0.98]"
                    onClick={() => {
                      table.getColumn('priority')?.setFilterValue('')
                      table.getColumn('status')?.setFilterValue('')
                    }}
                  >
                    Reset Filters
                  </Button>
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="min-h-[546px]s w-full overflow-x-auto rounded-xl border border-neutral-300 bg-white shadow-sm shadow-slate-900/10">
                <Table className="table-fixed">
                  <TableHeader className="bg-neutral-50">
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id} className="border-b border-neutral-200">
                        {hg.headers.map((header) => (
                          <TableHead key={header.id} className="px-4 py-3" style={{ width: `${header.getSize()}px` }}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>

                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="border-b border-neutral-200 bg-white hover:bg-neutral-50">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="px-4 py-2"
                            style={{ width: `${cell.column.getSize()}px` }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
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
          <div className="flex justify-center rounded-xl border bg-neutral-50 p-12">
            <div className="text-center">
              <CheckSquare className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
              <h3 className="text-ui-md font-medium text-neutral-900">No tasks yet</h3>
              <p className="text-ui-sm text-neutral-500">Create your first task to get started</p>
            </div>
          </div>
        )}

        <Outlet />
      </div>
    </>
  )
}
