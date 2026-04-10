"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Added 'Database' to the import list to fix the build error
import { 
  ArrowRight, BarChart3, Briefcase, Building2, Calendar, 
  Users, Zap, Sparkles, Rocket, Shield, Database 
} from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-8 h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900">EXOSPHERE</h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest leading-none">Command Center</p>
            </div>
          </div>
          <Link href="/admin">
            <Button className="bg-slate-900 hover:bg-black text-white rounded-xl px-6 h-11 font-bold transition-all hover:scale-105 shadow-md">
              Launch Console <Rocket className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 sm:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Hero Card */}
          <Card className="col-span-1 lg:col-span-2 bg-white border-slate-100 shadow-sm rounded-[2.5rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap size={200} />
            </div>
            <CardHeader className="p-8 lg:p-12 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-6 w-fit">
                <Sparkles size={14} /> SYSTEM OPERATIONAL
              </div>
              <CardTitle className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4">
                Orchestrate your <span className="text-indigo-600">SaaS Ecosystem</span> with precision.
              </CardTitle>
              <CardDescription className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                A professional-grade interface to manage events, career opportunities, and partner relationships. Optimized for speed and real-time synchronization.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 lg:p-12 pt-0">
              <div className="flex flex-wrap gap-4 mt-4">
                <Link href="/admin" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl px-8 h-14 shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1">
                    Enter Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-6 px-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-slate-900 leading-none">0ms</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Latency</span>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-100" />
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-slate-900 leading-none">256-bit</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Encryption</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side Performance Card */}
          <Card className="bg-slate-900 text-white border-none rounded-[2.5rem] p-8 lg:p-10 flex flex-col justify-between shadow-2xl shadow-indigo-200 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full"></div>
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                <BarChart3 className="text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Real-time Analytics</h3>
              <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
                Track user registrations, ticket conversions, and partner engagement with our built-in metrics engine.
              </p>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${30 * i}%` }}></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Core Modules Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ModuleCard 
            icon={Calendar} 
            title="Event Matrix" 
            desc="Control the full event lifecycle. Manage ticketing tiers, venue logistics, and schedules with atomic updates."
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <ModuleCard 
            icon={Building2} 
            title="Partner Hub" 
            desc="Centralized profile management for collaborating companies. Synchronize logos and metadata across the platform."
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <ModuleCard 
            icon={Briefcase} 
            title="Career Portal" 
            desc="Deploy internship opportunities and full-time roles. Monitor application streams and talent acquisition."
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Global Stats Footer */}
        <div className="mt-16 pt-12 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem label="System Uptime" value="99.99%" />
          <StatItem label="DB Handlers" value="Secure" />
          <StatItem label="Sync Mode" value="Real-time" />
          <StatItem label="Environment" value="Production" />
        </div>
      </section>

      <footer className="py-12 bg-white border-t border-slate-100 mt-20">
        <div className="mx-auto max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Database size={16} />
            <span className="text-xs font-bold tracking-widest uppercase">Admin Engine v3.0</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Powered by Firebase Realtime Architecture & Cloud Infrastructure
          </p>
        </div>
      </footer>
    </main>
  )
}

function ModuleCard({ icon: Icon, title, desc, color, bgColor }: any) {
  return (
    <Card className="bg-white border-slate-100 shadow-sm rounded-[2rem] p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className={`w-14 h-14 ${bgColor} ${color} rounded-2xl flex items-center justify-center mb-6`}>
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">
        {desc}
      </p>
    </Card>
  )
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">{label}</span>
      <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
    </div>
  )
}
