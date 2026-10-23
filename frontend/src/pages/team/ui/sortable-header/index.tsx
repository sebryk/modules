import type { UsersListParams } from '@/entities/user'

import { Center, Group, Text, UnstyledButton } from '@mantine/core'
import { ChevronsUpDownIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import { TEAM_COLUMN_LABELS } from '@/shared/data/team-page'

import classes from '../styles.module.css'

type SortableHeaderProps = {
   field: UsersListParams['sortBy']
   reversed: boolean
   sorted: boolean
   onSort: () => void
}

const SortableHeader = ({ field, reversed, sorted, onSort }: SortableHeaderProps) => (
   <UnstyledButton onClick={onSort} className={classes['team-page__sort-button']}>
      <Group wrap="nowrap" justify="space-between">
         <Text fw={600} size="sm" className={classes['team-page__sort-button-label']}>
            {TEAM_COLUMN_LABELS[field]}
         </Text>
         <Center className={classes['team-page__sort-icon']}>
            {sorted ? (
               reversed ? (
                  <ChevronDownIcon size={16} strokeWidth={1.5} />
               ) : (
                  <ChevronUpIcon size={16} strokeWidth={1.5} />
               )
            ) : (
               <ChevronsUpDownIcon size={16} strokeWidth={1.5} />
            )}
         </Center>
      </Group>
   </UnstyledButton>
)

export { SortableHeader }
