"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, onValue, remove, set, push } from "firebase/database"
import { 
  LogOut, Plus, Edit3, Trash2, Calendar, Briefcase, Building2, Users, 
  Save, X, Search, BarChart3, MapPin, Rocket, Shield, Database, 
  Sparkles, ChevronRight, LayoutDashboard, Globe, Settings 
} from "lucide-react"

const PIN = "5152"
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop"

// --- Helper Components ---

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: React.ElementType, color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs text-green-500 font-medium">
        <Sparkles className="h-3 w-3 mr-1" />
        <span>Live System Data</span>
      </div>
    </div>
  )
}

const arrayToString = (arr: string[] | undefined) => arr?.join('\n') || '';
const stringToArray = (str: string | undefined) => str ? str.split('\n').map(s => s.trim()).filter(Boolean) : [];

// --- EditForm Component ---
function EditForm({ type, data, companies, onSave, onCancel }: {
  type: string; data: any; companies: any; onSave: (data: any) => void; onCancel: () => void;
}) {
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const initialData = { ...(data || {}) };
    if (type === 'internships') {
      initialData.responsibilities = arrayToString(data?.responsibilities);
      initialData.requiredSkills = arrayToString(data?.requiredSkills);
      initialData.benefits = arrayToString(data?.benefits);
    }
    if (type === 'events') {
      initialData.address = data?.location?.address || '';
      initialData.latitude = data?.location?.latitude || '';
      initialData.longitude = data?.location?.longitude || '';
      delete initialData.location;
    }
    setFormData(initialData);
  }, [data, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    if (type === 'internships') {
      finalData.responsibilities = stringToArray(formData.responsibilities);
      finalData.requiredSkills = stringToArray(formData.requiredSkills);
      finalData.benefits = stringToArray(formData.benefits);
    }
    if (type === 'events') {
      finalData.location = {
        address: formData.address || '',
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
      };
      delete finalData.address; delete finalData.latitude; delete finalData.longitude;
    }
    onSave(finalData);
  }

  const getFields = () => {
    const fields = {
      events: [
        { name: 'title', label: 'Event Name', type: 'text', required: true },
        { name: 'image', label: 'Cover Image URL', type: 'url', required: true },
        { name: 'description', label: 'Event Description', type: 'textarea' },
        { name: 'dateTime', label: 'Date & Time', type: 'datetime-local' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'venue', label: 'Venue Name', type: 'text' },
        { name: 'address', label: 'Street Address', type: 'text' },
        { name: 'latitude', label: 'Lat', type: 'number' },
        { name: 'longitude', label: 'Long', type: 'number' },
      ],
      companies: [
        { name: 'name', label: 'Company Name', type: 'text', required: true },
        { name: 'logoUrl', label: 'Logo URL', type: 'url', required: true },
        { name: 'description', label: 'About Company', type: 'textarea' },
        { name: 'headquarters', label: 'Headquarters', type: 'text' },
        { name: 'website', label: 'Website URL', type: 'url' },
      ],
      internships: [
        { name: 'title', label: 'Role Title', type: 'text', required: true },
        { name: 'companyId', label: 'Partner Company', type: 'select', options: companies, required: true },
        { name: 'location', label: 'City', type: 'text' },
        { name: 'stipend', label: 'Compensation', type: 'text' },
        { name: 'applyUrl', label: 'Application Link', type: 'url' },
        { name: 'responsibilities', label: 'Responsibilities', type: 'textarea' },
      ],
    }
    return fields[type as keyof typeof fields] || [];
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {getFields().map((field) => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea 
              value={formData[field.name] || ''} 
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-32 text-sm"
              required={field.required}
            />
          ) : field.type === 'select' ? (
            <select 
              value={formData[field.name] || ''} 
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white outline-none text-sm"
            >
              <option value="">Select Option</option>
              {field.options && Object.entries(field.options).map(([id, c]: any) => <option key={id} value={id}>{c.name}</option>)}
            </select>
          ) : (
            <input 
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              required={field.required}
            />
          )}
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
          <Save size={18} /> SAVE CHANGES
        </button>
      </div>
    </form>
  )
}

// --- Main Admin Dashboard ---
export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState("")
  const [activeTab, setActiveTab] = useState("events")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [data, setData] = useState<any>({ events: {}, companies: {}, internships: {}, users: {} })
  const [searchQuery, setSearchQuery] = useState("")
  const [clerkUsers, setClerkUsers] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    if (document.cookie.includes('admin-auth=true')) setAuthenticated(true)
    const unsubscribes = ['events', 'companies', 'internships'].map(key => 
      onValue(ref(database, key), (s) => setData((p: any) => ({ ...p, [key]: s.val() || {} })))
    );
    fetch('/api/clerk-users').then(r => r.ok && r.json().then(setClerkUsers));
    return () => unsubscribes.forEach(u => u());
  }, [])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Gateway</h1>
            <p className="text-gray-500 mt-2">Authorization required to access Exosphere</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if(pin === PIN) { setAuthenticated(true); document.cookie = "admin-auth=true; path=/; max-age=86400" } }}>
            <input 
              type="password" value={pin} onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-3xl tracking-[0.5em] py-4 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono mb-6"
              placeholder="••••" maxLength={4}
            />
            <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-lg">
              AUTHENTICATE
            </button>
          </form>
        </div>
      </div>
    )
  }

  const getFilteredData = () => {
    const raw = activeTab === 'users' ? clerkUsers.map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}`, email: u.email_addresses[0].email_address })) : data[activeTab];
    return Object.entries(raw).filter(([_, item]: any) => 
      (item.title || item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
            <Database size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter">EXOSPHERE</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: "events", label: "Events", icon: Calendar, color: "text-blue-500" },
            { id: "companies", label: "Partners", icon: Building2, color: "text-purple-500" },
            { id: "internships", label: "Career", icon: Briefcase, color: "text-orange-500" },
            { id: "users", label: "Members", icon: Users, color: "text-green-500" },
          ].map(tab => (
            <button 
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button onClick={() => { document.cookie = "admin-auth=; max-age=0"; window.location.reload() }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm border border-gray-100">
            <LogOut size={16} /> SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 uppercase">
              {activeTab} Management
            </h2>
            <p className="text-gray-500 font-medium">Create, monitor, and manage your platform resources.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" placeholder="Quick search..." 
                className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 w-64 shadow-sm"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab !== 'users' && (
              <button onClick={() => setEditingItem({})} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all">
                <Plus size={20} /> CREATE
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Events" value={Object.keys(data.events).length} icon={Calendar} color="bg-blue-500" />
          <StatCard title="Partners" value={Object.keys(data.companies).length} icon={Building2} color="bg-purple-500" />
          <StatCard title="Internships" value={Object.keys(data.internships).length} icon={Briefcase} color="bg-orange-500" />
          <StatCard title="Active Users" value={clerkUsers.length} icon={Users} color="bg-green-500" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getFilteredData().map(([id, item]: any) => (
                <div key={id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-48 overflow-hidden relative">
                    <img src={item.image || item.logoUrl || PLACEHOLDER_IMAGE} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        {item.category || "Active"}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{item.title || item.name}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingItem({...item, id})} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => confirm("Delete this?") && remove(ref(database, `${activeTab}/${id}`))} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium leading-relaxed">
                      {item.description || item.email || "No details provided for this entry."}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center text-gray-400 text-xs font-bold uppercase gap-1">
                         <MapPin size={14} /> {item.location?.address || item.headquarters || "Remote"}
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Panel */}
          {editingItem ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl sticky top-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Editor</h3>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
              </div>
              <EditForm 
                type={activeTab} data={editingItem} companies={data.companies} 
                onSave={async (fd) => {
                  const r = editingItem.id ? ref(database, `${activeTab}/${editingItem.id}`) : push(ref(database, activeTab));
                  await set(r, fd); setEditingItem(null);
                }} 
                onCancel={() => setEditingItem(null)} 
              />
            </div>
          ) : (
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200 hidden xl:block">
              <Sparkles className="mb-4 opacity-50" size={32} />
              <h3 className="text-2xl font-black mb-2 leading-tight">Selection Required</h3>
              <p className="opacity-80 text-sm font-medium leading-relaxed">Select an item from the list to edit its properties, or click the Create button to launch a new instance.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
