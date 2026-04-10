"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, onValue, remove, set, push, update } from "firebase/database"
import { 
  LogOut, Plus, Edit3, Trash2, Calendar, Briefcase, Building2, Users, 
  Save, X, Search, BarChart3, MapPin, Rocket, Shield, Database, 
  Sparkles, ChevronRight, CheckCircle2, QrCode, FileText, Clock, AlertCircle
} from "lucide-react"

const PIN = "5152"
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop"

// --- UI Components ---

function StatCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${color}`} />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-black text-gray-900">{value}</p>
          {trend && <p className="text-[10px] text-green-500 font-bold mt-2 flex items-center gap-1"><Sparkles size={10}/> {trend}</p>}
        </div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100 shadow-inner`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

// --- OD Management List ---
function ODRequestItem({ request, onAction }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{request.userName || "Unknown Student"}</h4>
          <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12}/> {request.eventTitle} • {request.submittedAt}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <a href={request.proofUrl} target="_blank" className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors">VIEW PROOF</a>
        <button onClick={() => onAction(request.id, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><CheckCircle2 size={18}/></button>
        <button onClick={() => onAction(request.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><X size={18}/></button>
      </div>
    </div>
  )
}

const arrayToString = (arr: any) => Array.isArray(arr) ? arr.join('\n') : '';
const stringToArray = (str: string) => str ? str.split('\n').map(s => s.trim()).filter(Boolean) : [];

// --- EditForm ---
function EditForm({ type, data, companies, onSave, onCancel }: any) {
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const initialData = { ...(data || {}) };
    if (type === 'internships') {
      initialData.responsibilities = arrayToString(data?.responsibilities);
      initialData.requiredSkills = arrayToString(data?.requiredSkills);
    }
    if (type === 'events') {
      initialData.address = data?.location?.address || '';
      delete initialData.location;
    }
    setFormData(initialData);
  }, [data, type]);

  const getFields = () => {
    const fields = {
      events: [
        { name: 'title', label: 'Event Name', type: 'text', required: true },
        { name: 'image', label: 'Image URL', type: 'url', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'dateTime', label: 'Date/Time', type: 'datetime-local' },
        { name: 'venue', label: 'Venue', type: 'text' },
        { name: 'address', label: 'Map Address', type: 'text' },
      ],
      companies: [
        { name: 'name', label: 'Company Name', type: 'text', required: true },
        { name: 'logoUrl', label: 'Logo URL', type: 'url' },
        { name: 'description', label: 'About', type: 'textarea' },
        { name: 'headquarters', label: 'Headquarters', type: 'text' },
      ],
      internships: [
        { name: 'title', label: 'Role', type: 'text', required: true },
        { name: 'companyId', label: 'Partner', type: 'select', options: companies },
        { name: 'location', label: 'City', type: 'text' },
        { name: 'responsibilities', label: 'Responsibilities (New Line per item)', type: 'textarea' },
        { name: 'requiredSkills', label: 'Skills (New Line per item)', type: 'textarea' },
      ]
    }
    return fields[type as keyof typeof fields] || [];
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const final = { ...formData };
      if (type === 'internships') {
        final.responsibilities = stringToArray(formData.responsibilities);
        final.requiredSkills = stringToArray(formData.requiredSkills);
      }
      if (type === 'events') {
        final.location = { address: formData.address || '', latitude: 0, longitude: 0 };
        delete final.address;
      }
      onSave(final);
    }} className="space-y-4">
      {getFields().map((f: any) => (
        <div key={f.name}>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm h-28" />
          ) : f.type === 'select' ? (
            <select value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 outline-none text-sm">
              <option value="">Select Company</option>
              {Object.entries(f.options || {}).map(([id, c]: any) => <option key={id} value={id}>{c.name}</option>)}
            </select>
          ) : (
            <input type={f.type} value={formData[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm" required={f.required} />
          )}
        </div>
      ))}
      <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2">
        <Save size={18} /> UPDATE DATABASE
      </button>
    </form>
  )
}

// --- Main Dashboard ---
export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState("")
  const [activeTab, setActiveTab] = useState("events")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [data, setData] = useState<any>({ events: {}, companies: {}, internships: {}, users: {}, od_requests: {} })
  const [searchQuery, setSearchQuery] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)

  useEffect(() => {
    if (document.cookie.includes('admin-auth=true')) setAuthenticated(true)
    const nodes = ['events', 'companies', 'internships', 'users', 'od_requests'];
    const unsubs = nodes.map(node => 
      onValue(ref(database, node), (s) => setData((p: any) => ({ ...p, [node]: s.val() || {} })))
    );
    return () => unsubs.forEach(u => u());
  }, [])

  const handleODAction = async (requestId: string, status: string) => {
    await update(ref(database, `od_requests/${requestId}`), { status });
  }

  const handleQuickCheckIn = async (bookingId: string) => {
    // Logic to find booking in user nodes and update status to 'checked_in'
    setScanResult({ loading: true });
    // This is a simplified lookup
    let found = false;
    Object.entries(data.users).forEach(([uid, user]: any) => {
      if (user.tickets && user.tickets[bookingId]) {
        update(ref(database, `users/${uid}/tickets/${bookingId}`), { status: 'checked_in' });
        setScanResult({ success: true, name: user.name, event: user.tickets[bookingId].eventTitle });
        found = true;
      }
    });
    if (!found) setScanResult({ error: "Invalid Booking ID" });
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-5 rounded-3xl bg-indigo-50 text-indigo-600 mb-6 animate-bounce">
            <Shield size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Command Center</h1>
          <p className="text-gray-400 text-sm font-medium mb-10 uppercase tracking-widest">Enter Admin Signature</p>
          <form onSubmit={(e) => { e.preventDefault(); if(pin === PIN) { setAuthenticated(true); document.cookie = "admin-auth=true; path=/; max-age=86400" } }}>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full text-center text-4xl tracking-[0.6em] py-5 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-mono mb-8" placeholder="••••" maxLength={4} />
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl transition-all shadow-lg shadow-indigo-200">ACCESS SYSTEM</button>
          </form>
        </div>
      </div>
    )
  }

  const getFilteredData = () => {
    const raw = data[activeTab] || {};
    return Object.entries(raw).filter(([_, item]: any) => 
      (item.title || item.name || item.userName || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).reverse();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-gray-900 selection:bg-indigo-100">
      {/* Dynamic Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden xl:flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Database size={24} />
          </div>
          <span className="font-black text-2xl tracking-tighter">EXO<span className="text-indigo-600">SPHERE</span></span>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {[
            { id: "events", label: "Event Matrix", icon: Calendar, color: "text-blue-500" },
            { id: "companies", label: "Partners", icon: Building2, color: "text-purple-500" },
            { id: "internships", label: "Career Hub", icon: Briefcase, color: "text-orange-500" },
            { id: "od_requests", label: "OD Approval", icon: FileText, color: "text-red-500" },
            { id: "users", label: "Student Base", icon: Users, color: "text-green-500" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-8">
          <div className="bg-gray-900 rounded-[2rem] p-6 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Quick Action</p>
              <button onClick={() => setIsScanning(true)} className="flex items-center gap-2 font-bold text-sm bg-white/10 w-full p-3 rounded-xl hover:bg-white hover:text-black transition-all">
                <QrCode size={16}/> SCAN TICKETS
              </button>
            </div>
          </div>
          <button onClick={() => { document.cookie = "admin-auth=; max-age=0"; window.location.reload() }} className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-2xl text-gray-400 hover:text-red-500 transition-all font-bold text-xs tracking-widest uppercase">
            <LogOut size={16} /> Termination
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-16 overflow-y-auto h-screen">
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.3em] mb-3">
              <div className="w-8 h-[2px] bg-indigo-600" /> System Operational
            </div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight capitalize">
              {activeTab.replace('_', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input type="text" placeholder="Search parameters..." 
                className="pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/5 w-80 shadow-sm transition-all"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {activeTab !== 'users' && activeTab !== 'od_requests' && (
              <button onClick={() => setEditingItem({})} className="bg-gray-900 text-white font-black px-8 py-4 rounded-3xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                <Plus size={24} /> CREATE NEW
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Analytics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard title="Global Events" value={Object.keys(data.events).length} icon={Calendar} color="text-blue-600" trend="+12% this month" />
          <StatCard title="OD Requests" value={Object.values(data.od_requests).filter((r:any)=>r.status==='Pending').length} icon={FileText} color="text-orange-600" trend="Action Required" />
          <StatCard title="Talent Base" value={Object.keys(data.users).length} icon={Users} color="text-green-600" trend="Active Students" />
          <StatCard title="Career Roles" value={Object.keys(data.internships).length} icon={Briefcase} color="text-purple-600" trend="Partner Roles" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {activeTab === 'od_requests' ? (
              <div className="space-y-4">
                {getFilteredData().map(([id, req]: any) => <ODRequestItem key={id} request={{...req, id}} onAction={handleODAction} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {getFilteredData().map(([id, item]: any) => (
                  <div key={id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className="h-56 overflow-hidden relative">
                      <img src={item.image || item.logoUrl || PLACEHOLDER_IMAGE} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                         <p className="text-white text-xs font-bold tracking-widest">{item.category || "GENERAL"}</p>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-black text-xl text-gray-900 line-clamp-1">{item.title || item.name}</h3>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingItem({...item, id})} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                          <button onClick={() => confirm("Wipe from DB?") && remove(ref(database, `${activeTab}/${id}`))} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium leading-relaxed">{item.description || item.email || "System resource entry..."}</p>
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><MapPin size={12}/> {item.location?.address || item.headquarters || "Global"}</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contextual Sidebar Editor */}
          <div className="lg:col-span-4">
            {editingItem ? (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl sticky top-8 animate-in slide-in-from-right duration-500">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black tracking-tight">Editor</h3>
                  <button onClick={() => setEditingItem(null)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all"><X size={24} /></button>
                </div>
                <EditForm type={activeTab} data={editingItem} companies={data.companies} onCancel={() => setEditingItem(null)} 
                  onSave={async (fd: any) => {
                    const r = editingItem.id ? ref(database, `${activeTab}/${editingItem.id}`) : push(ref(database, activeTab));
                    await set(r, fd); setEditingItem(null);
                  }} 
                />
              </div>
            ) : (
              <div className="bg-indigo-600 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-indigo-200 sticky top-8 hidden xl:block overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all" />
                <Sparkles className="mb-6 opacity-50" size={48} />
                <h3 className="text-3xl font-black mb-4 leading-tight relative z-10">Database Ready</h3>
                <p className="opacity-70 text-sm font-medium leading-relaxed mb-8 relative z-10">Select an entity from the stream to begin modification, or launch a new instance using the primary create action.</p>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Shield size={18}/></div>
                  <span className="text-xs font-bold tracking-widest opacity-50">SECURE MODE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QR Scanner Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white rounded-[3rem] p-10 relative overflow-hidden">
            <button onClick={() => {setIsScanning(false); setScanResult(null)}} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-2xl transition-all"><X /></button>
            <div className="text-center mb-8">
              <QrCode className="mx-auto text-indigo-600 mb-4" size={48} />
              <h2 className="text-2xl font-black">Gatekeeper Terminal</h2>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Manual ID Entry for Check-in</p>
            </div>
            
            <div className="space-y-6">
              <input type="text" placeholder="Enter Booking ID (e.g. BK123)" onKeyDown={(e:any) => e.key === 'Enter' && handleQuickCheckIn(e.target.value)} 
                className="w-full text-center py-5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl outline-none focus:border-indigo-500 font-mono text-xl" />
              
              {scanResult?.loading && <div className="text-center animate-pulse text-indigo-600 font-bold">Verifying Signal...</div>}
              {scanResult?.success && (
                <div className="bg-green-50 border border-green-100 p-6 rounded-3xl text-center animate-in zoom-in duration-300">
                  <CheckCircle2 className="mx-auto text-green-600 mb-2" />
                  <p className="text-green-800 font-black text-lg">ACCESS GRANTED</p>
                  <p className="text-green-600 text-sm font-bold">{scanResult.name} checked into {scanResult.event}</p>
                </div>
              )}
              {scanResult?.error && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center">
                  <AlertCircle className="mx-auto text-red-600 mb-2" />
                  <p className="text-red-800 font-black">ACCESS DENIED</p>
                  <p className="text-red-600 text-xs font-bold">{scanResult.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
