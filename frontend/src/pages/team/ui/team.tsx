import type { UsersListParams } from '@/entities/user'

import { Container, Paper, Stack } from '@mantine/core'

import {
   ALL_POSITIONS_VALUE,
   ALL_STATUSES_VALUE,
   DEFAULT_PAGE_SIZE_VALUE,
} from '@/shared/data/team-page'
import { useDebouncedSearch } from '@/shared/hooks/use-debounced-search'
import { useFilters } from '@/shared/hooks/use-filters'
import { usePagination } from '@/shared/hooks/use-pagination'
import { useSorting } from '@/shared/hooks/use-sorting'

import { useTeamData } from '../model/use-team-data'
import { TeamFilters } from './team-filters'
import { TeamHeader } from './team-header'
import { TeamPagination } from './team-pagination'
import { TeamTable } from './team-table'

const TeamPage = () => {
   const { page, pageSize, setPage, setPageSize, resetPage, resetPagination } = usePagination({
      initialPageSize: Number(DEFAULT_PAGE_SIZE_VALUE),
   })
   const { searchValue, search, setSearchValue, resetSearch } = useDebouncedSearch({
      delay: 300,
      onChange: resetPage,
   })
   const { sortBy, sortOrder, setSorting } = useSorting<UsersListParams['sortBy']>({
      initialSortBy: 'createdAt',
      initialSortOrder: 'desc',
      onChange: resetPage,
   })
   const { filters, setFilter, resetFilters } = useFilters<
      Pick<UsersListParams, 'position' | 'status'>
   >({
      initialValues: { position: undefined, status: undefined },
      onChange: resetPage,
   })
   const params: UsersListParams = {
      ...filters,
      search: search || undefined,
      sortBy,
      sortOrder,
      page,
      pageSize,
   }
   const { totalPages, employees, totalEmployees, isLoading, isError, errorMessage, retry } =
      useTeamData(params, setPage)

   const setPositionValue = (value: string | null) => {
      setFilter('position', value && value !== ALL_POSITIONS_VALUE ? value : undefined)
   }

   const setStatusValue = (value: string | null) => {
      setFilter(
         'status',
         value === 'active' || value === 'invited' || value === 'vacation' ? value : undefined,
      )
   }

   const setPageSizeValue = (value: string | null) => {
      setPageSize(Number(value ?? DEFAULT_PAGE_SIZE_VALUE))
   }

   const resetTeamFilters = () => {
      resetSearch()
      resetFilters()
      resetPagination()
   }

   return (
      <Container py="xs" fluid={true} bg="var(--mantine-color-dark-8)">
         <Stack gap="lg">
            <TeamHeader />
            <TeamFilters
               searchValue={searchValue}
               onReset={resetTeamFilters}
               onSearchChange={setSearchValue}
               onStatusChange={setStatusValue}
               onPositionChange={setPositionValue}
               statusValue={filters.status ?? ALL_STATUSES_VALUE}
               positionValue={filters.position ?? ALL_POSITIONS_VALUE}
            />
            <Paper radius="lg" shadow="sm" withBorder={true} style={{ overflow: 'hidden' }}>
               <Stack gap={0}>
                  <TeamTable
                     sortBy={sortBy}
                     onRetry={retry}
                     isError={isError}
                     onSort={setSorting}
                     employees={employees}
                     isLoading={isLoading}
                     errorMessage={errorMessage}
                     reverseSortDirection={sortOrder === 'desc'}
                  />
                  {!isLoading && !isError && (
                     <TeamPagination
                        page={page}
                        onPageChange={setPage}
                        totalPages={totalPages}
                        totalCount={totalEmployees}
                        shownCount={employees.length}
                        pageSizeValue={String(pageSize)}
                        onPageSizeChange={setPageSizeValue}
                     />
                  )}
               </Stack>
            </Paper>
         </Stack>
      </Container>
   )
}

export { TeamPage }
