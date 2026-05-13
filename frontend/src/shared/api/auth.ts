import { isAxiosError } from "axios"

import { apiClient } from "@/shared/api/http"

type AccessTokenResponse = {
   accessToken: string
}

type LoginPayload = {
   email: string
   password: string
}

const parseAccessTokenResponse = (data: unknown): AccessTokenResponse => {
   const parsedData = data as Partial<AccessTokenResponse>

   if (typeof parsedData.accessToken !== "string") {
      throw new Error("Auth response does not contain access token.")
   }

   return { accessToken: parsedData.accessToken }
}

const loginRequest = async (payload: LoginPayload): Promise<string> => {
   try {
      const response = await apiClient.post("/auth/login", payload, {
         skipAuthRefresh: true,
      })
      const { accessToken } = parseAccessTokenResponse(response.data)

      return accessToken
   } catch (error) {
      if (isAxiosError(error)) {
         throw new Error(
            error.response?.status === 401
               ? "Неверный логин или пароль."
               : `Login failed: ${error.response?.status ?? "network"}`
         )
      }

      throw error
   }
}

const refreshAccessTokenRequest = async (): Promise<string> => {
   try {
      const response = await apiClient.post("/auth/refresh", undefined, {
         skipAuthRefresh: true,
      })
      const { accessToken } = parseAccessTokenResponse(response.data)

      return accessToken
   } catch (error) {
      if (isAxiosError(error)) {
         throw new Error(
            `Refresh failed: ${error.response?.status ?? "network"}`
         )
      }

      throw error
   }
}

const logoutRequest = async (): Promise<void> => {
   await apiClient.post("/auth/logout", undefined, {
      skipAuthRefresh: true,
   })
}

export { loginRequest, logoutRequest, refreshAccessTokenRequest }
