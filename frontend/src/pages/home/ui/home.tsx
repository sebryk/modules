import { DataTable } from "@/shared/ui/data-table"

import data from "@/shared/mocks/applications.json"

const HomePage = () => {
   return <DataTable data={data} />
}

export { HomePage }
