import { Button, Group, Paper, Select, Stack, Text, TextInput } from '@mantine/core'
import { SearchIcon } from 'lucide-react'

import { POSITION_OPTIONS, STATUS_OPTIONS, TEAM_FILTERS_CONTENT } from '@/shared/data/team-page'

type TeamFiltersProps = {
   searchValue: string
   positionValue: string | null
   statusValue: string | null
   onSearchChange: (value: string) => void
   onPositionChange: (value: string | null) => void
   onStatusChange: (value: string | null) => void
   onReset: () => void
}

const TeamFilters = ({
   searchValue,
   positionValue,
   statusValue,
   onSearchChange,
   onPositionChange,
   onStatusChange,
   onReset,
}: TeamFiltersProps) => {
   const { title, subtitle, reset, searchLabel, searchPlaceholder, positionLabel, statusLabel } =
      TEAM_FILTERS_CONTENT

   return (
      <Paper p="lg" radius="lg" shadow="sm" withBorder={true}>
         <Stack gap="md">
            <Group align="end" wrap="wrap" justify="space-between">
               <Stack gap={2}>
                  <Text fw={600}>{title}</Text>
                  <Text size="sm" c="dimmed">
                     {subtitle}
                  </Text>
               </Stack>
               <Button variant="default" onClick={onReset}>
                  {reset}
               </Button>
            </Group>

            <Group align="end" grow={true}>
               <TextInput
                  label={searchLabel}
                  value={searchValue}
                  placeholder={searchPlaceholder}
                  leftSection={<SearchIcon size={16} />}
                  onChange={(event) => {
                     onSearchChange(event.currentTarget.value)
                  }}
               />
               <Select
                  label={positionLabel}
                  value={positionValue}
                  data={POSITION_OPTIONS}
                  onChange={onPositionChange}
               />
               <Select
                  label={statusLabel}
                  value={statusValue}
                  data={STATUS_OPTIONS}
                  onChange={onStatusChange}
               />
            </Group>
         </Stack>
      </Paper>
   )
}

export { TeamFilters }
