import { Prisma } from '@prisma/client'

export function isPrismaErrorCode(error: unknown, code: string): boolean {
   return (
      (error instanceof Prisma.PrismaClientKnownRequestError ||
         (typeof error === 'object' && error !== null && 'code' in error)) &&
      error.code === code
   )
}
