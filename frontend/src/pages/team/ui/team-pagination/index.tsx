import { Group, Pagination, Select, Text } from '@mantine/core'

import {
   PAGE_SIZE_OPTIONS,
   TABLE_SECTION_BACKGROUND_COLOR,
   TEAM_PAGINATION_CONTENT,
} from '@/shared/data/team-page'

type TeamPaginationProps = {
   page: number
   totalPages: number
   pageSizeValue: string | null
   shownCount: number
   totalCount: number
   onPageChange: (page: number) => void
   onPageSizeChange: (value: string | null) => void
}

const TeamPagination = ({
   page,
   totalPages,
   pageSizeValue,
   shownCount,
   totalCount,
   onPageChange,
   onPageSizeChange,
}: TeamPaginationProps) => {
   const { pageSizeLabel, summary } = TEAM_PAGINATION_CONTENT

   return (
      <Group
         px="lg"
         py="md"
         wrap="wrap"
         justify="space-between"
         style={{
            backgroundColor: TABLE_SECTION_BACKGROUND_COLOR,
            borderTop: '1px solid var(--mantine-color-dark-4)',
         }}
      >
         <Text size="sm" c="dimmed">
            {summary(shownCount, totalCount)}
         </Text>
         <Group wrap="wrap">
            <Select
               w={170}
               value={pageSizeValue}
               data={PAGE_SIZE_OPTIONS}
               aria-label={pageSizeLabel}
               onChange={onPageSizeChange}
            />
            {totalPages > 1 && (
               <Pagination value={page} total={totalPages} onChange={onPageChange} />
            )}
         </Group>
      </Group>
   )
}

export { TeamPagination }
