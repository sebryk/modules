import type { ApplicationsList } from "@/entities/application/model/types"

const DEFAULT_API_BASE_URL = "http://localhost:3000"

const buildApiUrl = (path: string) => {
   const baseUrl = import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL

   return new URL(path, baseUrl).toString()
}

const fetchApplications = async () => {
   const response = await fetch(buildApiUrl("/applications"))

   if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.status}`)
   }

   const data = (await response.json()) as ApplicationsList

   return data.data
}

export { fetchApplications }
