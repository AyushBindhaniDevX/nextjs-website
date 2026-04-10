"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set, push, update, remove } from "firebase/database"
import { 
  LogOut, Plus, Edit3, Trash2, Calendar, Briefcase, Building2, Users, 
  Save, X, Search, Shield, Database, Sparkles, ChevronRight, 
  CheckCircle2, QrCode, FileText, AlertCircle, Phone, Mail, Ticket
} from "lucide-react"

const PIN = "5152"
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop"

// --- UI Components ---

function Badge({ children, color }: { children: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
  }
  return (
    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  )
}

// --- OD Management Item ---
function ODRequestItem({ request, student, onAction }: any) {
  const statusColor = request.status === 'Approved' ? 'green' : request.status === 'Rejected' ? 'red' : 'orange';

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex gap-5">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-gray-100">
            <Users size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h4 className="font-black text-xl text-gray-900">{request.userName || "Unknown Student"}</h4>
              <Badge color={statusColor}>{request.status.toUpperCase()}</Badge>
            </div>
            <p className="text-indigo-600 font-bold text-sm mb-3 flex items-center gap-2">
              <Calendar size={14}/> {request.eventTitle}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1"><Mail size={12}/> {student?.email || 'No Email'}</span>
              <span className="flex items-center gap-1"><Phone size={12}/> {student?.phone || 'No Phone'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-50">
          <div className="text-right">
             {request.proofUrl === "Verified by Gatekeeper Scan" ? (
               <div className="flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 px-3 py-2 rounded-xl">
                 <Shield size={14}/> SYSTEM VERIFIED
               </div>
             ) : (
               <a href={request.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                 VIEW PROOF <ChevronRight size={14}/>
               </a>
             )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onAction(request.id, 'Approved')} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition-all flex items-center gap-2">
              <CheckCircle2 size={16}/> APPROVE
            </button>
            <button onClick={() => onAction(request.id, 'Rejected')} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
              <X size={20}/>
            </button>
          </div>
        </div>
      </div>
    </div>
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
    const nodes = ['events', 'companies', 'internships', 'users', 'od_requests'];
    const unsubs = nodes.map(node => 
      onValue(ref(database, node), (s) => setData((p: any) => ({ ...p, [node]: s.val() || {} })))
    );
    return () => unsubs.forEach(u => u());
  }, [])

  const handleODAction = async (requestId: string, status: string) => {
    await update(ref(database, `od_requests/${requestId}`), { status });
  }

  // Manually Assign a Ticket to a Student
  const addManualTicket = async (userId: string) => {
    const eventId = prompt("Enter Event ID:");
    if (!eventId || !data.events[eventId]) return alert("Invalid Event ID");

    const bookingId = "BK" + Math.floor(100000 + Math.random() * 900000);
    const event = data.events[eventId];

    await set(ref(database, `users/${userId}/tickets/${bookingId}`), {
      bookingId,
      eventId,
      eventTitle: event.title,
      eventDateTime: event.dateTime,
      status: "active",
      purchaseDate: new Date().toISOString(),
      venue: event.venue || "TBD",
      totalPaid: 0,
      paymentId: "MANUAL_ENTRY"
    });
    alert(`Ticket ${bookingId} added to student record.`);
  }

  const handleQuickCheckIn = async (bookingId: string) => {
    setScanResult({ loading: true });
    let found = false;

    for (const [uid, user] of Object.entries(data.users) as any) {
      if (user.tickets && user.tickets[bookingId]) {
        const ticket = user.tickets[bookingId];
        await update(ref(database, `users/${uid}/tickets/${bookingId}`), { status: 'checked_in' });
        
        const odRequestRef = push(ref(database, 'od_requests'));
        await set(odRequestRef, {
          userId: uid,
          userName: user.name || "SRM Student",
          eventId: ticket.eventId,
          eventTitle: ticket.eventTitle,
          submittedAt: new Date().toLocaleString(),
          status: 'Pending',
          proofUrl: "Verified by Gatekeeper Scan",
          reason: "Entry scanned at gate."
        });

        setScanResult({ success: true, name: user.name, event: ticket.eventTitle });
        found = true;
        break;
      }
    }
    if (!found) setScanResult({ error: "Invalid ID" });
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-12 text-center">
          <Shield className="mx-auto text-indigo-600 mb-6" size={48} />
          <h1 className="text-3xl font-black text-gray-900 mb-2">Command Center</h1>
          <form onSubmit={(e) => { e.preventDefault(); if(pin === PIN) setAuthenticated(true) }}>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full text-center text-4xl py-5 bg-gray-50 rounded-3xl mb-8 outline-none" placeholder="PIN" maxLength={4} />
            <button className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl">ACCESS</button>
          </form>
        </div>
      </div>
    )
  }

  const getFilteredData = () => {
    const raw = data[activeTab] || {};
    return Object.entries(raw).filter(([_, item]: any) => 
      (item.title || item.name || item.userName || item.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).reverse();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden xl:flex flex-col sticky top-0 h-screen p-8">
        <div className="flex items-center gap-3 mb-12">
          <Database className="text-indigo-600" />
          <span className="font-black text-xl tracking-tighter">EXOSPHERE</span>
        </div>
        <nav className="flex-1 space-y-3">
          {[
            { id: "events", label: "Events", icon: Calendar },
            { id: "od_requests", label: "OD Matrix", icon: FileText },
            { id: "users", label: "Students", icon: Users },
            { id: "companies", label: "Partners", icon: Building2 },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>
        <button onClick={() => setIsScanning(true)} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
          <QrCode size={18}/> GATE SCANNER
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-black text-gray-900 capitalize">{activeTab.replace('_', ' ')}</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input type="text" placeholder="Search..." className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl outline-none w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </header>

        {/* Dynamic Content Views */}
        {activeTab === 'od_requests' ? (
          <div className="max-w-4xl space-y-6">
            {getFilteredData().map(([id, req]: any) => (
              <ODRequestItem key={id} request={{...req, id}} student={data.users[req.userId]} onAction={handleODAction} />
            ))}
          </div>
        ) : activeTab === 'users' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getFilteredData().map(([id, user]: any) => (
              <div key={id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-xl mb-1">{user.name || "SRM Student"}</h3>
                  <p className="text-gray-400 text-sm mb-4">{user.email}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge color="blue">Tickets: {user.tickets ? Object.keys(user.tickets).length : 0}</Badge>
                    <Badge color="orange">{user.phone || "No Phone"}</Badge>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-50 flex gap-2">
                  <button onClick={() => addManualTicket(id)} className="flex-1 bg-indigo-50 text-indigo-600 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2">
                    <Ticket size={14}/> ADD TICKET
                  </button>
                  <button onClick={() => confirm("Delete user?") && remove(ref(database, `users/${id}`))} className="p-3 bg-red-50 text-red-500 rounded-xl">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
             {getFilteredData().map(([id, item]: any) => (
               <div key={id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                  <img src={item.image || item.logoUrl || PLACEHOLDER_IMAGE} className="w-full h-40 object-cover rounded-2xl mb-4" />
                  <h3 className="font-black text-lg">{item.title || item.name}</h3>
                  <div className="flex justify-end gap-2 mt-4">
                     <button onClick={() => setEditingItem({...item, id})} className="p-2 bg-gray-50 rounded-lg text-indigo-600"><Edit3 size={16}/></button>
                     <button onClick={() => remove(ref(database, `${activeTab}/${id}`))} className="p-2 bg-red-50 rounded-lg text-red-600"><Trash2 size={16}/></button>
                  </div>
               </div>
             ))}
          </div>
        )}
      </main>

      {/* Gatekeeper Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">Gate Entry Scanner</h3>
              <button onClick={() => setIsScanning(false)} className="text-gray-400"><X /></button>
            </div>
            <input autoFocus type="text" placeholder="Scan Booking ID" className="w-full py-5 text-center bg-gray-50 rounded-2xl font-mono text-2xl border-2 border-indigo-100 mb-6" onKeyDown={(e:any) => e.key === 'Enter' && handleQuickCheckIn(e.target.value)} />
            {scanResult?.success && (
              <div className="p-6 bg-green-50 rounded-2xl text-center">
                <CheckCircle2 className="mx-auto text-green-600 mb-2" size={32} />
                <p className="font-black text-green-800">CHECKED IN</p>
                <p className="text-green-600 text-sm">{scanResult.name} verified.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
