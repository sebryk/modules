import type { ApplicationsList } from '@/entities/application/model/types'

import axios from 'axios'

import { apiClient } from '@/shared/api/http'

const fetchApplications = async () => {
   try {
      const response = await apiClient.get<ApplicationsList>('/applications')

      return response.data.data
   } catch (error) {
      if (axios.isAxiosError(error)) {
         throw new Error(`Failed to fetch applications: ${error.response?.status ?? 'network'}`)
      }

      throw error
   }
}

export { fetchApplications }
