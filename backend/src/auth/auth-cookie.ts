import fastifyCookie from '@fastify/cookie'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken'

const parseDurationToSeconds = (value: string): number | undefined => {
   const parsedValue = Number(value)

   if (Number.isFinite(parsedValue)) {
      return parsedValue
   }

   const match = value.match(/^(\d+)([smhd])$/i)

   if (!match) {
      return undefined
   }

   const amount = Number(match[1])
   const unit = match[2].toLowerCase()

   const multiplier = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 60 * 60 : 60 * 60 * 24

   return amount * multiplier
}

const getRefreshCookieOptions = (refreshTokenTtl?: string) => ({
   httpOnly: true,
   path: '/',
   sameSite: 'lax' as const,
   secure: process.env.NODE_ENV === 'production',
   maxAge: refreshTokenTtl ? parseDurationToSeconds(refreshTokenTtl) : undefined,
})

const registerCookiePlugin = async (app: NestFastifyApplication) => {
   await (
      app as unknown as {
         register: (plugin: typeof fastifyCookie) => Promise<void>
      }
   ).register(fastifyCookie)
}

const getRefreshTokenCookie = (request: FastifyRequest): string | null =>
   request.cookies[REFRESH_TOKEN_COOKIE_NAME] ?? null

const setRefreshTokenCookie = (
   reply: FastifyReply,
   refreshToken: string,
   refreshTokenTtl: string,
) => {
   reply.setCookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      getRefreshCookieOptions(refreshTokenTtl),
   )
}

const clearRefreshTokenCookie = (reply: FastifyReply) => {
   reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshCookieOptions())
}

export {
   clearRefreshTokenCookie,
   getRefreshTokenCookie,
   registerCookiePlugin,
   setRefreshTokenCookie,
}
