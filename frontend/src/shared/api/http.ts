import axios, { AxiosError } from "axios"

import {
   clearSession,
   getAccessToken,
   setAccessToken,
} from "@/entities/session"
import { refreshAccessTokenRequest } from "@/shared/api/auth"
import { getApiBaseUrl } from "@/shared/api/config"
import { ROUTES } from "@/shared/config/routes"

declare module "axios" {
   export interface AxiosRequestConfig {
      skipAuthRefresh?: boolean
   }

   export interface InternalAxiosRequestConfig {
      _retry?: boolean
      skipAuthRefresh?: boolean
   }
}

const apiClient = axios.create({
   baseURL: getApiBaseUrl(),
   withCredentials: true,
})

const redirectToLogin = () => {
   if (typeof window === "undefined") {
      return
   }

   if (window.location.pathname === ROUTES.login) {
      return
   }

   window.location.replace(ROUTES.login)
}

let refreshPromise: Promise<string> | null = null

const recoverAccessToken = async (): Promise<string> => {
   if (!refreshPromise) {
      refreshPromise = (async () => {
         try {
            const accessToken = await refreshAccessTokenRequest()
            setAccessToken(accessToken)

            return accessToken
         } catch (error) {
            clearSession()
            redirectToLogin()
            throw error
         } finally {
            refreshPromise = null
         }
      })()
   }

   return refreshPromise
}

apiClient.interceptors.request.use((config) => {
   const accessToken = getAccessToken()

   if (!accessToken) {
      return config
   }

   config.headers.set("authorization", `Bearer ${accessToken}`)

   return config
})

apiClient.interceptors.response.use(
   (response) => response,
   async (error: AxiosError) => {
      const responseStatus = error.response?.status
      const config = error.config

      if (
         responseStatus !== 401 ||
         !config ||
         config._retry ||
         config.skipAuthRefresh
      ) {
         throw error
      }

      config._retry = true
      const nextAccessToken = await recoverAccessToken()
      config.headers.set("authorization", `Bearer ${nextAccessToken}`)

      return apiClient(config)
   }
)

export { apiClient }
