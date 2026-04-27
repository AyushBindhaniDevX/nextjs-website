"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set, push, update, remove } from "firebase/database"
import { 
  LogOut, Plus, Edit3, Trash2, Calendar, Briefcase, Building2, Users, 
  Save, X, Search, Shield, Database, Sparkles, ChevronRight, 
  CheckCircle2, QrCode, FileText, AlertCircle, Phone, Mail, Ticket, Eye, Clock
} from "lucide-react"

const PIN = "5152"
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop"

// --- UI Components ---

function Badge({ children, color }: { children: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  }
  return (
    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  )
}

// Ticket Modal Component
function TicketModal({ ticket, onClose }: { ticket: any; onClose: () => void }) {
  if (!ticket) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-black">🎟️ Ticket Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><X size={20} /></button>
        </div>
        <div className="space-y-3 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl">
          <p><span className="font-bold text-gray-600">Booking ID:</span> <span className="font-mono text-indigo-700">{ticket.bookingId}</span></p>
          <p><span className="font-bold text-gray-600">Event:</span> {ticket.eventTitle}</p>
          <p><span className="font-bold text-gray-600">Date/Time:</span> {ticket.eventDateTime}</p>
          <p><span className="font-bold text-gray-600">Venue:</span> {ticket.venue || 'TBD'}</p>
          <p><span className="font-bold text-gray-600">Status:</span> <Badge color={ticket.status === 'checked_in' ? 'green' : 'blue'}>{ticket.status}</Badge></p>
          <p><span className="font-bold text-gray-600">Purchased:</span> {new Date(ticket.purchaseDate).toLocaleDateString()}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Close</button>
        </div>
      </div>
    </div>
  )
}

// Edit/Create Modal
function EditItemModal({ item, type, onSave, onClose }: { item: any; type: string; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(item || { title: '', name: '', image: '', logoUrl: '', dateTime: '', venue: '' })
  const isEvent = type === 'events'
  const isCompany = type === 'companies'
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-black mb-4">{item?.id ? 'Edit' : 'Create'} {type.slice(0, -1)}</h3>
        <input 
          name={isEvent ? 'title' : 'name'} 
          value={form.title || form.name || ''} 
          onChange={handleChange} 
          placeholder={isEvent ? 'Title' : 'Name'} 
          className="w-full p-3 bg-gray-50 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-200" 
        />
        {isEvent && (
          <>
            <input name="dateTime" value={form.dateTime || ''} onChange={handleChange} placeholder="Date & Time" className="w-full p-3 bg-gray-50 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-200" />
            <input name="venue" value={form.venue || ''} onChange={handleChange} placeholder="Venue" className="w-full p-3 bg-gray-50 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-200" />
          </>
        )}
        {isCompany && (
          <input name="industry" value={form.industry || ''} onChange={handleChange} placeholder="Industry" className="w-full p-3 bg-gray-50 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-indigo-200" />
        )}
        <input 
          name="image" 
          value={form.image || form.logoUrl || ''} 
          onChange={handleChange} 
          placeholder="Image URL" 
          className="w-full p-3 bg-gray-50 rounded-xl mb-5 outline-none focus:ring-2 focus:ring-indigo-200" 
        />
        <div className="flex gap-3">
          <button onClick={() => onSave(form)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Save</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// OD Request Item
function ODRequestItem({ request, student, onAction }: any) {
  const statusColor = request.status === 'Approved' ? 'green' : request.status === 'Rejected' ? 'red' : 'orange'
  
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between gap-5">
        <div className="flex gap-5">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <FileText size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h4 className="font-black text-xl text-gray-800">{request.userName || "Unknown Student"}</h4>
              <Badge color={statusColor}>{request.status.toUpperCase()}</Badge>
            </div>
            <p className="text-indigo-600 font-semibold text-sm mb-2 flex items-center gap-1">
              <Calendar size={14} /> {request.eventTitle}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Mail size={12} /> {student?.email || 'N/A'}</span>
              <span className="flex items-center gap-1"><Phone size={12} /> {student?.phone || 'N/A'}</span>
            </div>
            {request.reason && <p className="text-gray-500 text-xs mt-2 italic">📌 {request.reason}</p>}
          </div>
        </div>
        <div className="flex flex-row md:flex-col items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0">
          <div className="text-right">
            {request.proofUrl === "Verified by Gatekeeper Scan" ? (
              <div className="flex items-center gap-1 text-green-700 text-xs bg-green-50 px-3 py-1.5 rounded-xl">
                <Shield size={14} /> System Verified
              </div>
            ) : (
              <a href="#" className="text-indigo-600 text-xs font-bold bg-indigo-50 px-4 py-2 rounded-xl inline-flex items-center gap-1">
                View Proof <ChevronRight size={12} />
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onAction(request.id, 'Approved')} 
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition flex items-center gap-1"
            >
              <CheckCircle2 size={14} /> Approve
            </button>
            <button 
              onClick={() => onAction(request.id, 'Rejected')} 
              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition"
            >
              <X size={18} />
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
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showUserTickets, setShowUserTickets] = useState<any>(null)

  useEffect(() => {
    const nodes = ['events', 'companies', 'internships', 'users', 'od_requests']
    const unsubs = nodes.map(node => 
      onValue(ref(database, node), (snap) => {
        setData((prev: any) => ({ ...prev, [node]: snap.val() || {} }))
      })
    )
    return () => unsubs.forEach(u => u())
  }, [])

  const handleODAction = async (requestId: string, status: string) => {
    await update(ref(database, `od_requests/${requestId}`), { status })
  }

  // Add Manual Ticket to Student
  const addManualTicket = async (userId: string) => {
    const eventId = prompt("Enter Event ID:")
    if (!eventId || !data.events[eventId]) return alert("Invalid Event ID")

    const bookingId = "BK" + Math.floor(100000 + Math.random() * 900000)
    const event = data.events[eventId]

    await set(ref(database, `users/${userId}/tickets/${bookingId}`), {
      bookingId,
      eventId,
      eventTitle: event.title,
      eventDateTime: event.dateTime || new Date().toLocaleString(),
      status: "active",
      purchaseDate: new Date().toISOString(),
      venue: event.venue || "Campus",
      totalPaid: 0,
      paymentId: "MANUAL_ENTRY"
    })
    alert(`✅ Ticket ${bookingId} added to student record.`)
  }

  const handleQuickCheckIn = async (bookingId: string) => {
    setScanResult({ loading: true })
    let found = false

    for (const [uid, user] of Object.entries(data.users) as any) {
      if (user.tickets && user.tickets[bookingId]) {
        const ticket = user.tickets[bookingId]
        if (ticket.status === 'checked_in') {
          setScanResult({ error: "Already checked in" })
          found = true
          break
        }
        
        await update(ref(database, `users/${uid}/tickets/${bookingId}`), { status: 'checked_in' })
        
        const odRequestRef = push(ref(database, 'od_requests'))
        await set(odRequestRef, {
          userId: uid,
          userName: user.name || "SRM Student",
          eventId: ticket.eventId,
          eventTitle: ticket.eventTitle,
          submittedAt: new Date().toLocaleString(),
          status: 'Pending',
          proofUrl: "Verified by Gatekeeper Scan",
          reason: "Entry scanned at gate."
        })

        setScanResult({ success: true, name: user.name, event: ticket.eventTitle })
        found = true
        break
      }
    }
    if (!found) setScanResult({ error: "Invalid Booking ID" })
    
    setTimeout(() => {
      setTimeout(() => setScanResult(null), 2500)
    }, 100)
  }

  // CRUD Operations
  const handleSaveEdit = async (formData: any) => {
    if (!editingItem) return
    const { id } = editingItem
    
    let updateData: any = {}
    if (activeTab === 'events') {
      updateData = { 
        title: formData.title, 
        dateTime: formData.dateTime, 
        venue: formData.venue, 
        image: formData.image 
      }
    } else if (activeTab === 'companies') {
      updateData = { 
        name: formData.name, 
        logoUrl: formData.image,
        industry: formData.industry 
      }
    } else {
      updateData = { title: formData.title, ...formData }
    }
    
    await update(ref(database, `${activeTab}/${id}`), updateData)
    setEditingItem(null)
  }

  const handleCreate = async () => {
    const newId = `${activeTab.slice(0, -1)}_${Date.now()}`
    let newObj: any = { id: newId }
    
    if (activeTab === 'events') {
      newObj = { 
        title: "New Event", 
        dateTime: "TBD", 
        venue: "TBD", 
        image: PLACEHOLDER_IMAGE 
      }
    } else if (activeTab === 'companies') {
      newObj = { 
        name: "New Partner", 
        logoUrl: PLACEHOLDER_IMAGE,
        industry: "Technology"
      }
    } else {
      newObj = { 
        title: "New Internship", 
        company: "TBD",
        stipend: "TBD",
        location: "Remote"
      }
    }
    
    await set(ref(database, `${activeTab}/${newId}`), newObj)
    setEditingItem({ id: newId, type: activeTab, ...newObj })
  }

  const handleDelete = async (id: string) => {
    if (confirm("⚠️ Permanently delete this item?")) {
      await remove(ref(database, `${activeTab}/${id}`))
    }
  }

  const getFilteredData = () => {
    const raw = data[activeTab] || {}
    return Object.entries(raw).filter(([_, item]: any) => 
      (item.title || item.name || item.userName || item.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-12 text-center">
          <Shield className="mx-auto text-indigo-600 mb-6" size={48} />
          <h1 className="text-3xl font-black text-gray-900 mb-2">Command Center</h1>
          <form onSubmit={(e) => { e.preventDefault(); if(pin === PIN) setAuthenticated(true); else alert("Wrong PIN") }}>
            <input 
              type="password" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              className="w-full text-center text-4xl py-5 bg-gray-50 rounded-3xl mb-8 outline-none focus:ring-2 focus:ring-indigo-200" 
              placeholder="PIN" 
              maxLength={4} 
              autoFocus 
            />
            <button className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl hover:bg-indigo-700 transition">ACCESS</button>
          </form>
        </div>
      </div>
    )
  }

  const filteredData = getFilteredData()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden xl:flex flex-col sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-10">
          <Database className="text-indigo-600" size={24} />
          <span className="font-black text-2xl tracking-tighter">EXOSPHERE</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { id: "events", label: "Events", icon: Calendar },
            { id: "od_requests", label: "OD Matrix", icon: FileText },
            { id: "users", label: "Students", icon: Users },
            { id: "companies", label: "Partners", icon: Building2 },
            { id: "internships", label: "Internships", icon: Briefcase },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id); setEditingItem(null) }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>
        <button 
          onClick={() => setIsScanning(true)} 
          className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition mt-6"
        >
          <QrCode size={18} /> GATE SCANNER
        </button>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 capitalize">
            {activeTab.replace('_', ' ')}
          </h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-200" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
        </header>

        {/* Dynamic Content Views */}
        {activeTab === 'od_requests' && (
          <div className="max-w-4xl space-y-5">
            {filteredData.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center text-gray-400">
                ✨ No OD requests found
              </div>
            )}
            {filteredData.map(([id, req]: any) => (
              <ODRequestItem 
                key={id} 
                request={{...req, id}} 
                student={data.users[req.userId]} 
                onAction={handleODAction} 
              />
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map(([id, user]: any) => (
              <div key={id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-xl">{user.name || "SRM Student"}</h3>
                      <p className="text-gray-500 text-sm">{user.email || "No email"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowUserTickets(user)} 
                        className="p-2 bg-indigo-50 rounded-xl text-indigo-600 hover:bg-indigo-100 transition"
                        title="View Tickets"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => confirm("Delete user?") && remove(ref(database, `users/${id}`))} 
                        className="p-2 bg-red-50 rounded-xl text-red-500 hover:bg-red-100 transition"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge color="purple">Tickets: {user.tickets ? Object.keys(user.tickets).length : 0}</Badge>
                    <Badge color="orange">{user.phone || "No Phone"}</Badge>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => addManualTicket(id)} 
                      className="w-full bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition"
                    >
                      <Ticket size={14} /> Assign Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'events' || activeTab === 'companies' || activeTab === 'internships') && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {filteredData.map(([id, item]: any) => (
              <div key={id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition group">
                <div className="h-44 overflow-hidden bg-gray-100">
                  <img 
                    src={item.image || item.logoUrl || PLACEHOLDER_IMAGE} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    alt={item.title || item.name}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg">{item.title || item.name}</h3>
                  {item.dateTime && (
                    <p className="text-indigo-500 text-xs font-semibold mt-1 flex items-center gap-1">
                      <Calendar size={12} /> {item.dateTime}
                    </p>
                  )}
                  {item.venue && <p className="text-gray-400 text-xs mt-1">{item.venue}</p>}
                  {item.industry && <p className="text-gray-400 text-xs mt-1">{item.industry}</p>}
                  {item.stipend && <p className="text-green-600 text-xs font-semibold mt-1">💰 {item.stipend}</p>}
                </div>
                <div className="flex border-t border-gray-50 divide-x divide-gray-50">
                  <button 
                    onClick={() => setEditingItem({ id, type: activeTab, ...item })} 
                    className="flex-1 py-3 text-indigo-600 font-bold text-sm flex items-center justify-center gap-1 hover:bg-indigo-50 transition"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(id)} 
                    className="flex-1 py-3 text-red-500 font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-50 transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
            <button 
              onClick={handleCreate} 
              className="border-2 border-dashed border-indigo-200 rounded-3xl h-80 flex flex-col items-center justify-center gap-3 text-indigo-500 hover:bg-indigo-50 transition group"
            >
              <Plus size={32} strokeWidth={1.5} className="group-hover:scale-110 transition" />
              <span className="font-bold">Add New</span>
            </button>
          </div>
        )}
      </main>

      {/* Gatekeeper Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsScanning(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black">Gate Entry Scanner</h3>
              <button onClick={() => setIsScanning(false)} className="text-gray-400 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            <input 
              autoFocus 
              type="text" 
              placeholder="Scan / Enter Booking ID" 
              className="w-full py-4 text-center bg-gray-50 rounded-2xl font-mono text-xl border-2 border-indigo-100 focus:border-indigo-400 outline-none transition"
              onKeyDown={(e: any) => e.key === 'Enter' && handleQuickCheckIn(e.target.value)} 
            />
            {scanResult?.success && (
              <div className="mt-5 p-4 bg-green-50 rounded-2xl text-center">
                <CheckCircle2 className="mx-auto text-green-600 mb-2" size={32} />
                <p className="font-bold text-green-800">✓ CHECKED IN</p>
                <p className="text-green-600 text-sm">{scanResult.name} verified for {scanResult.event}</p>
              </div>
            )}
            {scanResult?.error && (
              <div className="mt-5 p-4 bg-red-50 rounded-2xl text-center">
                <AlertCircle className="mx-auto text-red-600 mb-2" size={32} />
                <p className="font-bold text-red-800">Error</p>
                <p className="text-red-600 text-sm">{scanResult.error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingItem && (
        <EditItemModal 
          item={editingItem} 
          type={activeTab} 
          onSave={handleSaveEdit} 
          onClose={() => setEditingItem(null)} 
        />
      )}

      {/* User Tickets Modal */}
      {showUserTickets && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUserTickets(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
              <h3 className="text-2xl font-black">🎫 {showUserTickets.name}'s Tickets</h3>
              <button onClick={() => setShowUserTickets(null)} className="text-gray-400 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            {showUserTickets.tickets && Object.keys(showUserTickets.tickets).length > 0 ? (
              <div className="space-y-3">
                {Object.values(showUserTickets.tickets).map((ticket: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="border border-gray-100 rounded-2xl p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div>
                      <p className="font-bold text-gray-800">{ticket.eventTitle}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={10} /> {ticket.eventDateTime}
                      </p>
                    </div>
                    <Badge color={ticket.status === 'checked_in' ? 'green' : 'blue'}>
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No tickets assigned yet</p>
            )}
            <button 
              className="w-full mt-5 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2"
              onClick={() => addManualTicket(showUserTickets.id)}
            >
              <Plus size={16} /> Assign New Ticket
            </button>
          </div>
        </div>
      )}

      {/* Single Ticket Detail Modal */}
      {selectedTicket && (
        <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </div>
  )
}
