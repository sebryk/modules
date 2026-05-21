import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

const TeamPage = () => {
   return (
      <div className="px-4 lg:px-6">
         <Card>
            <CardHeader className="gap-3">
               <CardTitle>Team</CardTitle>
               <CardDescription>
                  Team management will live here once the user list API is ready.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="rounded-lg border border-dashed px-4 py-10 text-sm text-muted-foreground">
                  This route is wired and ready for the future team module.
               </div>
            </CardContent>
         </Card>
      </div>
   )
}

export { TeamPage }
