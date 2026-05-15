import { DataTable } from "@/shared/ui/data-table"

import data from "@/shared/mocks/applications.json"

const Dashboard = () => {
   return <DataTable data={data} />
}

export { Dashboard }
