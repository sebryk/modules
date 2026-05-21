export type ApplicationStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export type Application = {
   id: string
   title: string
   description: string
   status: ApplicationStatus
   createdBy: string
   createdAt: string
   updatedAt: string
}

export type ApplicationsList = {
   data: Application[]
}
