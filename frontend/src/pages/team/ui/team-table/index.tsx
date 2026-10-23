import type { User, UsersListParams } from '@/entities/user'

import { Alert, Button, Loader, ScrollArea, Stack, Table, Text } from '@mantine/core'

import {
   TABLE_COLUMN_WIDTHS,
   TABLE_MIN_WIDTH,
   TABLE_SECTION_BACKGROUND_COLOR,
   TEAM_SORT_FIELDS,
   TEAM_TABLE_CONTENT,
} from '@/shared/data/team-page'

import { SortableHeader } from '../sortable-header'
import { TeamTableRow } from '../team-table-row'

type TeamTableProps = {
   employees: User[]
   sortBy: UsersListParams['sortBy']
   reverseSortDirection: boolean
   onSort: (field: UsersListParams['sortBy']) => void
   isLoading: boolean
   isError: boolean
   errorMessage: string
   onRetry: () => void
}

const TeamTable = ({
   employees,
   sortBy,
   reverseSortDirection,
   onSort,
   isLoading,
   isError,
   errorMessage,
   onRetry,
}: TeamTableProps) => (
   <ScrollArea>
      <Table
         verticalSpacing="md"
         aria-busy={isLoading}
         miw={TABLE_MIN_WIDTH}
         horizontalSpacing="lg"
         highlightOnHover={true}
         style={{ tableLayout: 'fixed' }}
      >
         <colgroup>
            {TEAM_SORT_FIELDS.map((field) => (
               <col key={field} style={{ width: TABLE_COLUMN_WIDTHS[field] }} />
            ))}
            <col style={{ width: TABLE_COLUMN_WIDTHS.actions }} />
         </colgroup>
         <Table.Thead style={{ backgroundColor: TABLE_SECTION_BACKGROUND_COLOR }}>
            <Table.Tr>
               {TEAM_SORT_FIELDS.map((field) => (
                  <Table.Th
                     key={field}
                     aria-sort={
                        sortBy === field
                           ? reverseSortDirection
                              ? 'descending'
                              : 'ascending'
                           : 'none'
                     }
                  >
                     <SortableHeader
                        field={field}
                        sorted={sortBy === field}
                        reversed={reverseSortDirection}
                        onSort={() => {
                           onSort(field)
                        }}
                     />
                  </Table.Th>
               ))}
               <Table.Th />
            </Table.Tr>
         </Table.Thead>
         <Table.Tbody>
            {isLoading ? (
               <Table.Tr>
                  <Table.Td colSpan={TEAM_SORT_FIELDS.length + 1}>
                     <Stack py="xl" gap="sm" role="status" align="center" aria-live="polite">
                        <Loader size="sm" />
                        <Text size="sm" c="dimmed">
                           {TEAM_TABLE_CONTENT.loading}
                        </Text>
                     </Stack>
                  </Table.Td>
               </Table.Tr>
            ) : isError ? (
               <Table.Tr>
                  <Table.Td colSpan={TEAM_SORT_FIELDS.length + 1}>
                     <Alert color="red" role="alert" title={TEAM_TABLE_CONTENT.errorTitle}>
                        <Stack gap="sm" align="flex-start">
                           <Text size="sm">{errorMessage}</Text>
                           <Button variant="light" onClick={onRetry}>
                              {TEAM_TABLE_CONTENT.retry}
                           </Button>
                        </Stack>
                     </Alert>
                  </Table.Td>
               </Table.Tr>
            ) : employees.length === 0 ? (
               <Table.Tr>
                  <Table.Td colSpan={TEAM_SORT_FIELDS.length + 1}>
                     <Stack py="xl" gap="xs" role="status" align="center">
                        <Text fw={500}>{TEAM_TABLE_CONTENT.empty}</Text>
                        <Text size="sm" c="dimmed">
                           {TEAM_TABLE_CONTENT.emptyDescription}
                        </Text>
                     </Stack>
                  </Table.Td>
               </Table.Tr>
            ) : (
               employees.map((employee) => <TeamTableRow key={employee.id} employee={employee} />)
            )}
         </Table.Tbody>
      </Table>
   </ScrollArea>
)

export { TeamTable }
