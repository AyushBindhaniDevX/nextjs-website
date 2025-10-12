import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart2, Briefcase, Building2, Calendar, Users } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-50">
      <header className="border-b bg-white dark:bg-gray-950/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2 text-primary-foreground">
              <Calendar className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Exosphere Admin</h1>
          </div>
          <Link href="/admin">
            <Button>
              Open Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Hero Card */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Your Dashboard</CardTitle>
              <CardDescription className="text-base">
                Manage all aspects of your Exosphere application from one central hub.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6 leading-relaxed">
                This admin panel provides the tools to create, update, and delete events, companies, and internships directly in your Firebase Realtime Database. Use the links below to get started.
              </p>
              <Link href="/admin">
                <Button size="lg">Go to Admin Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Side Card */}
          <Card className="flex flex-col justify-between bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">View Analytics</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Get insights into user engagement and ticket sales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <BarChart2 className="h-24 w-24 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <Card className="hover:border-primary/50 hover:shadow-md transition-all">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <CardTitle>Manage Events</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              Create, edit, and delete events. Update images, dates, locations, and ticketing details.
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 hover:shadow-md transition-all">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle>Manage Companies</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              Keep company profiles up to date with logos, descriptions, and other key information.
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 hover:shadow-md transition-all">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Briefcase className="h-6 w-6" />
              </div>
              <CardTitle>Manage Internships</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              Post new internship positions and maintain current openings with clear role details.
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="mt-12 border-t">
        <div className="mx-auto max-w-7xl p-6 text-center text-sm text-muted-foreground">
          Admin tools powered by Firebase Realtime Database.
        </div>
      </footer>
    </main>
  )
}