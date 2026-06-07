import { apiClient } from '@/shared/api/http'

import type { Me } from '../model/types'

const getMeRequest = async (): Promise<Me> => {
   const response = await apiClient.get('/auth/me')
   const user = response.data as Me

   if (!user || !Array.isArray(user.permissions)) {
      throw new Error('Me response has invalid format.')
   }

   return user
}

export { getMeRequest }
