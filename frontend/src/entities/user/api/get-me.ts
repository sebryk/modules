import { apiClient } from "@/shared/api/http"

import type { MeResponse } from "../model/types"

const getMeRequest = async (): Promise<MeResponse> => {
   const response = await apiClient.get("/auth/me")
   const data = response.data as Partial<MeResponse>

   if (!data.user || !Array.isArray(data.permissions)) {
      throw new Error("Me response has invalid format.")
   }

   return {
      user: data.user,
      permissions: data.permissions,
   }
}

export { getMeRequest }
