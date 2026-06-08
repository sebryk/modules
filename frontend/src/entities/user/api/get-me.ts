import type { Me } from '../model/types'
import type { ApiResponse } from '@/shared/types/api'

import { apiClient } from '@/shared/api/http'

const getMeRequest = async (): Promise<Me> => {
   const response = await apiClient.get<ApiResponse<Me>>('/auth/me')
   const { data: user} = response.data 

   if (!user || !Array.isArray(user.permissions)) {
      throw new Error('Me response has invalid format.')
   }

   return user
}

export { getMeRequest }
