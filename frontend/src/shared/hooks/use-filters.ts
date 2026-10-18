import { useState } from 'react'

const useFilters = <TFilters extends object>({
   initialValues,
   onChange,
}: {
   initialValues: TFilters
   onChange?: () => void
}) => {
   const [filters, setFilters] = useState(initialValues)

   const setFilter = <TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => {
      setFilters((current) => ({ ...current, [key]: value }))
      onChange?.()
   }

   const resetFilters = () => {
      setFilters(initialValues)
      onChange?.()
   }

   return { filters, setFilter, resetFilters }
}

export { useFilters }
