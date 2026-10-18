import { useState } from 'react'

const useSorting = <TField extends string>({
   initialSortBy,
   initialSortOrder = 'asc',
   onChange,
}: {
   initialSortBy: TField
   initialSortOrder?: 'asc' | 'desc'
   onChange?: () => void
}) => {
   const [sorting, setSortingState] = useState({
      sortBy: initialSortBy,
      sortOrder: initialSortOrder,
   })

   const setSorting = (field: TField) => {
      setSortingState((current) => ({
         sortBy: field,
         sortOrder: current.sortBy === field && current.sortOrder === 'asc' ? 'desc' : 'asc',
      }))
      onChange?.()
   }

   return { ...sorting, setSorting }
}

export { useSorting }
