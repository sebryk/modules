import { useState } from 'react'

import { useDebouncedCallback } from '@mantine/hooks'

const useDebouncedSearch = ({ delay, onChange }: { delay: number; onChange?: () => void }) => {
   const [searchValue, setRawSearchValue] = useState('')
   const [search, setSearch] = useState('')
   const applySearch = useDebouncedCallback((value: string) => {
      const nextSearch = value.trim()

      if (nextSearch !== search) {
         setSearch(nextSearch)
         onChange?.()
      }
   }, delay)

   const setSearchValue = (value: string) => {
      setRawSearchValue(value)
      applySearch(value)
   }

   const resetSearch = () => {
      applySearch.cancel()
      setRawSearchValue('')
      setSearch('')

      if (search !== '') {
         onChange?.()
      }
   }

   return { searchValue, search, setSearchValue, resetSearch }
}

export { useDebouncedSearch }
