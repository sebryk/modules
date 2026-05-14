/* eslint-disable react-hooks/incompatible-library */
import * as React from "react"
import {
   closestCenter,
   DndContext,
   KeyboardSensor,
   MouseSensor,
   TouchSensor,
   useSensor,
   useSensors,
   type DragEndEvent,
   type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
   arrayMove,
   SortableContext,
   verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
   flexRender,
   getCoreRowModel,
   getFacetedRowModel,
   getFacetedUniqueValues,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   useReactTable,
   type ColumnDef,
   type ColumnFiltersState,
   type Row,
   type SortingState,
   type VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/shared/ui/table"
import { Tabs, TabsContent } from "@/shared/ui/tabs"
import { EllipsisVerticalIcon } from "lucide-react"

type DataTableItem = {
   id: number
   employee: string
   email: string
   position: string
   isSystem: boolean
}

const columns: ColumnDef<DataTableItem>[] = [
   {
      id: "select",
      header: ({ table }) => (
         <div className="flex items-center justify-center">
            <Checkbox
               checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
               }
               onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
               }
               aria-label="Select all"
            />
         </div>
      ),
      cell: ({ row }) => (
         <div className="flex items-center justify-center">
            <Checkbox
               checked={row.getIsSelected()}
               onCheckedChange={(value) => row.toggleSelected(!!value)}
               aria-label="Select row"
            />
         </div>
      ),
      enableSorting: false,
      enableHiding: false,
   },
   {
      id: "employee",
      accessorKey: "employee",
      header: "ФИО сотрудника",
      cell: ({ row }) => {
         return <div>{row.original.employee}</div>
      },
   },
   {
      id: "email",
      accessorKey: "email",
      header: "Электронная почта",
      cell: ({ row }) => {
         return <div>{row.original.email}</div>
      },
   },
   {
      id: "position",
      accessorKey: "position",
      header: "Должность",
      cell: ({ row }) => {
         return <div>{row.original.position}</div>
      },
   },
   {
      id: "actions",
      cell: () => (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                  variant="ghost"
                  className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
               >
                  <EllipsisVerticalIcon />
                  <span className="sr-only">Open menu</span>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
               <DropdownMenuItem>Edit</DropdownMenuItem>
               <DropdownMenuItem>Make a copy</DropdownMenuItem>
               <DropdownMenuItem>Favorite</DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      ),
   },
]

function Row({ row }: { row: Row<DataTableItem> }) {
   return (
      <>
         {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
               {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
         ))}
      </>
   )
}

export function DataTable({ data: initialData }: { data: DataTableItem[] }) {
   const [data, setData] = React.useState(() => initialData)
   const [rowSelection, setRowSelection] = React.useState({})
   const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({})
   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
      []
   )
   const [sorting, setSorting] = React.useState<SortingState>([])
   const [pagination, setPagination] = React.useState({
      pageIndex: 0,
      pageSize: 10,
   })
   const sortableId = React.useId()
   const sensors = useSensors(
      useSensor(MouseSensor, {}),
      useSensor(TouchSensor, {}),
      useSensor(KeyboardSensor, {})
   )

   const dataIds = React.useMemo<UniqueIdentifier[]>(
      () => data?.map(({ id }) => id) || [],
      [data]
   )

   const table = useReactTable({
      data,
      columns,
      state: {
         sorting,
         columnVisibility,
         rowSelection,
         columnFilters,
         pagination,
      },
      getRowId: (row) => row.id.toString(),
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
   })

   function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event
      if (active && over && active.id !== over.id) {
         setData((data) => {
            const oldIndex = dataIds.indexOf(active.id)
            const newIndex = dataIds.indexOf(over.id)
            return arrayMove(data, oldIndex, newIndex)
         })
      }
   }

   return (
      <Tabs
         defaultValue="outline"
         className="w-full flex-col justify-start gap-6"
      >
         <TabsContent
            value="outline"
            className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
         >
            <div className="overflow-hidden rounded-lg border">
               <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragEnd={handleDragEnd}
                  sensors={sensors}
                  id={sortableId}
               >
                  <Table>
                     <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                           <TableRow key={headerGroup.id}>
                              {headerGroup.headers.map((header) => {
                                 return (
                                    <TableHead
                                       key={header.id}
                                       colSpan={header.colSpan}
                                    >
                                       {header.isPlaceholder
                                          ? null
                                          : flexRender(
                                               header.column.columnDef.header,
                                               header.getContext()
                                            )}
                                    </TableHead>
                                 )
                              })}
                           </TableRow>
                        ))}
                     </TableHeader>
                     <TableBody className="**:data-[slot=table-cell]:first:w-8">
                        {table.getRowModel().rows?.length ? (
                           <SortableContext
                              items={dataIds}
                              strategy={verticalListSortingStrategy}
                           >
                              {table.getRowModel().rows.map((row) => (
                                 <Row key={row.id} row={row} />
                              ))}
                           </SortableContext>
                        ) : (
                           <TableRow>
                              <TableCell
                                 colSpan={columns.length}
                                 className="h-24 text-center"
                              >
                                 No results.
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               </DndContext>
            </div>
         </TabsContent>
      </Tabs>
   )
}
