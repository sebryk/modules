import { useState } from 'react'

const usePagination = ({ initialPageSize }: { initialPageSize: number }) => {
   const [page, setPage] = useState(1)
   const [pageSize, setRawPageSize] = useState(initialPageSize)

   const resetPage = () => {
      setPage(1)
   }

   const setPageSize = (value: number) => {
      setRawPageSize(value)
      resetPage()
   }

   const resetPagination = () => {
      setPageSize(initialPageSize)
   }

   return { page, pageSize, setPage, setPageSize, resetPage, resetPagination }
}

export { usePagination }
