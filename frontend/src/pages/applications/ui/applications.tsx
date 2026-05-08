import { useEffect, useState } from "react"

import { fetchApplications } from "@/entities/application/api/fetch-applications"
import type {
   Application,
   ApplicationStatus,
} from "@/entities/application/model/types"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/shared/ui/card"
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/shared/ui/table"

const statusLabels: Record<ApplicationStatus, string> = {
   NEW: "New",
   IN_PROGRESS: "In progress",
   DONE: "Done",
   CANCELLED: "Cancelled",
}

const formatDate = (value: string) => {
   const date = new Date(value)

   if (Number.isNaN(date.getTime())) {
      return value
   }

   return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
   }).format(date)
}

const ApplicationsPage = () => {
   const [applications, setApplications] = useState<Application[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [errorMessage, setErrorMessage] = useState<string | null>(null)

   const loadApplications = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
         const nextApplications = await fetchApplications()
         setApplications(nextApplications)
      } catch (error) {
         setErrorMessage(
            error instanceof Error
               ? error.message
               : "Failed to fetch applications."
         )
      } finally {
         setIsLoading(false)
      }
   }

   useEffect(() => {
      let isMounted = true

      const hydrateApplications = async () => {
         try {
            const nextApplications = await fetchApplications()

            if (!isMounted) {
               return
            }

            setApplications(nextApplications)
            setErrorMessage(null)
         } catch (error) {
            if (!isMounted) {
               return
            }

            setErrorMessage(
               error instanceof Error
                  ? error.message
                  : "Failed to fetch applications."
            )
         } finally {
            if (isMounted) {
               setIsLoading(false)
            }
         }
      }

      void hydrateApplications()

      return () => {
         isMounted = false
      }
   }, [])

   return (
      <div className="px-4 lg:px-6">
         <Card>
            <CardHeader className="gap-3">
               <CardTitle>Applications</CardTitle>
               <CardDescription>
                  Review submitted applications from the backend API.
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {isLoading ? (
                  <div className="rounded-lg border border-dashed px-4 py-10 text-sm text-muted-foreground">
                     Loading applications...
                  </div>
               ) : null}

               {!isLoading && errorMessage ? (
                  <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4">
                     <p className="text-sm text-foreground">{errorMessage}</p>
                     <p className="text-sm text-muted-foreground">
                        The page stays available even if the API responds with
                        401, 403, or a network error.
                     </p>
                     <div>
                        <Button onClick={() => void loadApplications()}>
                           Retry request
                        </Button>
                     </div>
                  </div>
               ) : null}

               {!isLoading && !errorMessage && applications.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-4 py-10 text-sm text-muted-foreground">
                     No applications found.
                  </div>
               ) : null}

               {!isLoading && !errorMessage && applications.length > 0 ? (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Title</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>Created by</TableHead>
                           <TableHead>Created at</TableHead>
                           <TableHead>Updated at</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {applications.map((application) => (
                           <TableRow key={application.id}>
                              <TableCell className="min-w-52 whitespace-normal">
                                 <div className="space-y-1">
                                    <p className="font-medium">
                                       {application.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                       {application.description}
                                    </p>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <Badge variant="outline">
                                    {statusLabels[application.status]}
                                 </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                 {application.createdBy}
                              </TableCell>
                              <TableCell>
                                 {formatDate(application.createdAt)}
                              </TableCell>
                              <TableCell>
                                 {formatDate(application.updatedAt)}
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               ) : null}
            </CardContent>
         </Card>
      </div>
   )
}

export { ApplicationsPage }
