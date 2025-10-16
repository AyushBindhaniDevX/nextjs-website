
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart2, Briefcase, Building2, Calendar, Users, Zap, Sparkles, Rocket } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-background text-foreground relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary neo-shadow-sm rounded-lg opacity-20 float-animation"></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-secondary neo-shadow-sm rounded-full opacity-30 float-animation" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-accent neo-shadow-sm opacity-25 float-animation" style={{animationDelay: '4s'}}></div>
      
      <header className="border-b-4 bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2 text-primary-foreground neo-shadow neo-border">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">EXOSPHERE ADMIN</h1>
              <p className="text-sm text-muted-foreground font-medium">NEO-BRUTALISM EDITION</p>
            </div>
          </div>
          <Link href="/admin">
            <Button className="neo-shadow neo-button bg-primary text-primary-foreground font-bold py-3 px-6 neo-border text-lg">
              LAUNCH DASHBOARD
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Hero Card */}
          <Card className="col-span-1 lg:col-span-2 bg-card neo-shadow-lg neo-border p-1">
            <div className="bg-card border-4 border-foreground p-6">
              <CardHeader className="p-0 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                  <CardTitle className="text-4xl font-black tracking-tight">WELCOME TO YOUR COMMAND CENTER</CardTitle>
                </div>
                <CardDescription className="text-lg font-medium">
                  Manage all aspects of your Exosphere application from one central hub with powerful Neo-brutalism interface.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <p className="mb-6 leading-relaxed text-lg font-medium">
                  This admin panel provides the tools to create, update, and delete events, companies, and internships directly in your Firebase Realtime Database. Experience the raw power of neo-brutalist design.
                </p>
                <Link href="/admin">
                  <Button className="neo-shadow-lg neo-button bg-primary text-primary-foreground font-black py-4 px-8 neo-border text-lg w-full sm:w-auto">
                    ACTIVATE ADMIN DASHBOARD
                  </Button>
                </Link>
              </CardContent>
            </div>
          </Card>

          {/* Side Card */}
          <Card className="flex flex-col justify-between bg-primary text-primary-foreground neo-shadow-lg neo-border p-1">
            <div className="border-4 border-foreground p-6 h-full flex flex-col">
              <CardHeader className="p-0 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-6 w-6" />
                  <CardTitle className="text-2xl font-black">VIEW ANALYTICS</CardTitle>
                </div>
                <CardDescription className="text-primary-foreground/90 font-medium">
                  Get powerful insights into user engagement and ticket sales with brutalist data visualization.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-grow flex items-center justify-center">
                <div className="relative">
                  <BarChart2 className="h-24 w-24 opacity-90" />
                  <div className="absolute -inset-4 bg-primary-foreground/10 rounded-full pulse-glow"></div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <Card className="neo-shadow neo-border p-1 bg-card hover:neo-shadow-lg transition-all duration-300 hover:-translate-y-2">
            <div className="border-4 border-foreground p-6 h-full">
              <CardHeader className="flex-row items-center gap-4 space-y-0 p-0 pb-4">
                <div className="rounded-lg bg-primary/20 p-3 text-primary neo-shadow-sm neo-border">
                  <Calendar className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-black">MANAGE EVENTS</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-base leading-relaxed text-muted-foreground font-medium">
                Create, edit, and delete events with brutalist efficiency. Update images, dates, locations, and ticketing details with raw power.
              </CardContent>
            </div>
          </Card>

          <Card className="neo-shadow neo-border p-1 bg-card hover:neo-shadow-lg transition-all duration-300 hover:-translate-y-2">
            <div className="border-4 border-foreground p-6 h-full">
              <CardHeader className="flex-row items-center gap-4 space-y-0 p-0 pb-4">
                <div className="rounded-lg bg-secondary/20 p-3 text-secondary neo-shadow-sm neo-border">
                  <Building2 className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-black">MANAGE COMPANIES</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-base leading-relaxed text-muted-foreground font-medium">
                Keep company profiles up to date with logos, descriptions, and other key information in brutalist style.
              </CardContent>
            </div>
          </Card>

          <Card className="neo-shadow neo-border p-1 bg-card hover:neo-shadow-lg transition-all duration-300 hover:-translate-y-2">
            <div className="border-4 border-foreground p-6 h-full">
              <CardHeader className="flex-row items-center gap-4 space-y-0 p-0 pb-4">
                <div className="rounded-lg bg-accent/20 p-3 text-accent neo-shadow-sm neo-border">
                  <Briefcase className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-black">MANAGE INTERNSHIPS</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-base leading-relaxed text-muted-foreground font-medium">
                Post new internship positions and maintain current openings with clear role details and brutalist clarity.
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card neo-shadow neo-border p-4 text-center">
            <div className="text-3xl font-black text-primary">24/7</div>
            <div className="text-sm font-medium text-muted-foreground">UPTIME</div>
          </div>
          <div className="bg-card neo-shadow neo-border p-4 text-center">
            <div className="text-3xl font-black text-secondary">100%</div>
            <div className="text-sm font-medium text-muted-foreground">POWER</div>
          </div>
          <div className="bg-card neo-shadow neo-border p-4 text-center">
            <div className="text-3xl font-black text-accent">∞</div>
            <div className="text-sm font-medium text-muted-foreground">POSSIBILITIES</div>
          </div>
          <div className="bg-card neo-shadow neo-border p-4 text-center">
            <div className="text-3xl font-black text-primary">⚡</div>
            <div className="text-sm font-medium text-muted-foreground">SPEED</div>
          </div>
        </div>
      </section>

      <footer className="mt-12 border-t-4">
        <div className="mx-auto max-w-7xl p-6 text-center text-base font-medium text-muted-foreground neo-border-t">
          ADMIN TOOLS POWERED BY FIREBASE REALTIME DATABASE. NEO-BRUTALISM DESIGN SYSTEM.
        </div>
      </footer>
    </main>
  )
}
