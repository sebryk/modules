import type { FastifyRequest } from 'fastify'

export type AuthenticatedRequest = FastifyRequest & {
   user: {
      id: string
   }
}
