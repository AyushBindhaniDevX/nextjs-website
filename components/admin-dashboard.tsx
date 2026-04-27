"use client"

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set, push, update, remove } from "firebase/database"
import { 
  LogOut, Plus, Edit3, Trash2, Calendar, Briefcase, Building2, Users, 
  Save, X, Search, Shield, Database, Sparkles, ChevronRight, 
  CheckCircle2, QrCode, FileText, AlertCircle, Phone, Mail, Ticket, 
  Eye, Clock, MapPin, DollarSign, Globe, Award, Link, List, Star
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
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
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
          <p><span className="font-bold text-gray-600">Date/Time:</span> {new Date(ticket.eventDateTime).toLocaleString()}</p>
          <p><span className="font-bold text-gray-600">Venue:</span> {ticket.venue || 'TBD'}</p>
          <p><span className="font-bold text-gray-600">Status:</span> <Badge color={ticket.status === 'checked_in' ? 'green' : 'blue'}>{ticket.status}</Badge></p>
          <p><span className="font-bold text-gray-600">Total Paid:</span> <span className="text-green-600 font-bold">₹{ticket.totalPaid}</span></p>
          <p><span className="font-bold text-gray-600">Purchased:</span> {new Date(ticket.purchaseDate).toLocaleDateString()}</p>
          {ticket.selectedTickets && (
            <div>
              <p className="font-bold text-gray-600 mb-1">Tickets:</p>
              <div className="space-y-1 text-sm">
                {Object.entries(ticket.selectedTickets).map(([ticketId, qty]: any) => (
                  <p key={ticketId}>• {ticketId}: {qty} ticket(s)</p>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Close</button>
        </div>
      </div>
    </div>
  )
}

// Event Edit Modal
function EventModal({ event, onSave, onClose }: { event: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(event || { 
    title: '', image: '', category: '', description: '', 
    dateTime: '', venue: '', location: { address: '' }, tickets: [] 
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'address') {
      setForm({ ...form, location: { ...form.location, address: e.target.value } })
    } else {
      setForm({ ...form, [e.target.name]: e.target.value })
    }
  }

  const addTicket = () => {
    const newTicket = { id: `t${form.tickets.length + 1}`, name: 'New Ticket', price: '0' }
    setForm({ ...form, tickets: [...form.tickets, newTicket] })
  }

  const updateTicket = (index: number, field: string, value: string) => {
    const updated = [...form.tickets]
    updated[index][field] = value
    setForm({ ...form, tickets: updated })
  }

  const removeTicket = (index: number) => {
    const updated = form.tickets.filter((_: any, i: number) => i !== index)
    setForm({ ...form, tickets: updated })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-black mb-4">{event?.id ? 'Edit Event' : 'Create Event'}</h3>
        
        <div className="space-y-3">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="dateTime" value={form.dateTime} onChange={handleChange} placeholder="Date Time (ISO format)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="venue" value={form.venue} onChange={handleChange} placeholder="Venue" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="address" value={form.location?.address || ''} onChange={handleChange} placeholder="Address" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold">Ticket Types</h4>
              <button type="button" onClick={addTicket} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus size={16}/> Add Ticket</button>
            </div>
            {form.tickets.map((ticket: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input value={ticket.name} onChange={(e) => updateTicket(idx, 'name', e.target.value)} placeholder="Ticket name" className="flex-1 p-2 bg-gray-50 rounded-lg text-sm" />
                <input value={ticket.price} onChange={(e) => updateTicket(idx, 'price', e.target.value)} placeholder="Price" className="w-24 p-2 bg-gray-50 rounded-lg text-sm" />
                <button onClick={() => removeTicket(idx)} className="p-2 text-red-500"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Save</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// Company Edit Modal
function CompanyModal({ company, onSave, onClose }: { company: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(company || { 
    name: '', logoUrl: '', website: '', headquarters: '', 
    foundedYear: '', employeeCount: '', globalCustomers: '', description: '' 
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-black mb-4">{company?.id ? 'Edit Company' : 'Create Company'}</h3>
        <div className="space-y-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Company Name" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="logoUrl" value={form.logoUrl} onChange={handleChange} placeholder="Logo URL" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="website" value={form.website} onChange={handleChange} placeholder="Website" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="headquarters" value={form.headquarters} onChange={handleChange} placeholder="Headquarters" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="foundedYear" value={form.foundedYear} onChange={handleChange} placeholder="Founded Year" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="employeeCount" value={form.employeeCount} onChange={handleChange} placeholder="Employee Count" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="globalCustomers" value={form.globalCustomers} onChange={handleChange} placeholder="Global Customers" className="w-full p-3 bg-gray-50 rounded-xl" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="w-full p-3 bg-gray-50 rounded-xl" />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Save</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// Internship Edit Modal
function InternshipModal({ internship, companies, onSave, onClose }: { internship: any; companies: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(internship || { 
    companyId: '', title: '', category: '', location: '', type: '', 
    durationMonths: '', shiftTiming: '', applyUrl: '', responsibilities: [], requiredSkills: [] 
  })
  const [newResponsibility, setNewResponsibility] = useState('')
  const [newSkill, setNewSkill] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setForm({ ...form, responsibilities: [...form.responsibilities, newResponsibility] })
      setNewResponsibility('')
    }
  }

  const removeResponsibility = (index: number) => {
    setForm({ ...form, responsibilities: form.responsibilities.filter((_: any, i: number) => i !== index) })
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, newSkill] })
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setForm({ ...form, requiredSkills: form.requiredSkills.filter((_: any, i: number) => i !== index) })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-black mb-4">{internship?.id ? 'Edit Internship' : 'Create Internship'}</h3>
        <div className="space-y-3">
          <select name="companyId" value={form.companyId} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl">
            <option value="">Select Company</option>
            {Object.entries(companies).map(([id, company]: any) => (
              <option key={id} value={id}>{company.name}</option>
            ))}
          </select>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Internship Title" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="type" value={form.type} onChange={handleChange} placeholder="Type (Internship/Full-time)" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="durationMonths" value={form.durationMonths} onChange={handleChange} placeholder="Duration (months)" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="shiftTiming" value={form.shiftTiming} onChange={handleChange} placeholder="Shift Timing" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="applyUrl" value={form.applyUrl} onChange={handleChange} placeholder="Apply URL" className="w-full p-3 bg-gray-50 rounded-xl" />
          
          {/* Responsibilities */}
          <div className="border-t pt-3">
            <label className="font-bold block mb-2">Responsibilities</label>
            <div className="flex gap-2 mb-2">
              <input value={newResponsibility} onChange={(e) => setNewResponsibility(e.target.value)} placeholder="Add responsibility" className="flex-1 p-2 bg-gray-50 rounded-lg" />
              <button onClick={addResponsibility} className="px-4 bg-indigo-600 text-white rounded-lg">Add</button>
            </div>
            <div className="space-y-1">
              {form.responsibilities.map((resp: string, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                  <span className="text-sm">• {resp}</span>
                  <button onClick={() => removeResponsibility(idx)} className="text-red-500"><X size={14}/></button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Required Skills */}
          <div className="border-t pt-3">
            <label className="font-bold block mb-2">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add skill" className="flex-1 p-2 bg-gray-50 rounded-lg" />
              <button onClick={addSkill} className="px-4 bg-indigo-600 text-white rounded-lg">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.requiredSkills.map((skill: string, idx: number) => (
                <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {skill} <button onClick={() => removeSkill(idx)}><X size={12}/></button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Save</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// OD Request Item
function ODRequestItem({ request, user, onAction }: any) {
  const statusColor = request.status === 'Approved' ? 'green' : request.status === 'Rejected' ? 'red' : 'orange'
  
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row justify-between gap-5">
        <div className="flex gap-5">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <FileText size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h4 className="font-black text-xl text-gray-800">{user?.name || "Unknown Student"}</h4>
              <Badge color={statusColor}>{request.status.toUpperCase()}</Badge>
            </div>
            <p className="text-indigo-600 font-semibold text-sm mb-2 flex items-center gap-1">
              <Calendar size={14} /> Event ID: {request.eventId}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Mail size={12} /> {user?.email || 'No Email'}</span>
              <span className="flex items-center gap-1"><Phone size={12} /> {user?.phone || 'No Phone'}</span>
              <span className="flex items-center gap-1"><Award size={12} /> {user?.registerNumber || 'No Register No'}</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">Requested: {new Date(request.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-row md:flex-col items-end gap-3 pt-4 md:pt-0">
          <div className="flex gap-2">
            <button onClick={() => onAction(request.id, 'Approved')} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition flex items-center gap-1">
              <CheckCircle2 size={14} /> Approve
            </button>
            <button onClick={() => onAction(request.id, 'Rejected')} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition">
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
  const [modalType, setModalType] = useState<string | null>(null)
  const [data, setData] = useState<any>({ events: {}, companies: {}, internships: {}, users: {}, od_requests: {} })
  const [searchQuery, setSearchQuery] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showUserTickets, setShowUserTickets] = useState<any>(null)

  useEffect(() => {
    const nodes = ['events', 'companies', 'internships', 'users']
    const unsubs = nodes.map(node => 
      onValue(ref(database, node), (snap) => {
        setData((prev: any) => ({ ...prev, [node]: snap.val() || {} }))
      })
    )
    
    // Load OD requests from users
    const usersRef = ref(database, 'users')
    onValue(usersRef, (snap) => {
      const users = snap.val() || {}
      const allODRequests: any = {}
      Object.entries(users).forEach(([userId, userData]: any) => {
        if (userData.od_requests) {
          Object.entries(userData.od_requests).forEach(([odId, odData]: any) => {
            allODRequests[`${userId}_${odId}`] = { ...odData, userId, id: odId }
          })
        }
      })
      setData((prev: any) => ({ ...prev, od_requests: allODRequests }))
    })
    
    return () => unsubs.forEach(u => u())
  }, [])

  const handleODAction = async (requestId: string, status: string) => {
    const [userId, odId] = requestId.split('_')
    await update(ref(database, `users/${userId}/od_requests/${odId}`), { status })
  }

  const addManualTicket = async (userId: string) => {
    const eventId = prompt("Enter Event ID:")
    if (!eventId || !data.events[eventId]) return alert("Invalid Event ID")

    const bookingId = "BK" + Math.floor(100000 + Math.random() * 900000)
    const event = data.events[eventId]

    await set(ref(database, `users/${userId}/tickets/${bookingId}`), {
      bookingId,
      eventId,
      eventTitle: event.title,
      eventImage: event.image,
      eventDateTime: event.dateTime,
      venue: event.venue,
      purchaseDate: new Date().toISOString(),
      totalPaid: 0,
      paymentId: "MANUAL_ENTRY",
      selectedTickets: { general: 1 },
      status: "active"
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
        
        const odId = `od_${Date.now()}`
        await set(ref(database, `users/${uid}/od_requests/${odId}`), {
          id: odId,
          eventId: ticket.eventId,
          status: 'pending',
          createdAt: new Date().toISOString()
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
  const handleSaveEvent = async (formData: any) => {
    if (editingItem?.id) {
      await update(ref(database, `events/${editingItem.id}`), formData)
    } else {
      const newId = `event_${Date.now()}`
      await set(ref(database, `events/${newId}`), { ...formData, id: newId })
    }
    setEditingItem(null)
    setModalType(null)
  }

  const handleSaveCompany = async (formData: any) => {
    if (editingItem?.id) {
      await update(ref(database, `companies/${editingItem.id}`), formData)
    } else {
      const newId = `company_${Date.now()}`
      await set(ref(database, `companies/${newId}`), { ...formData, id: newId })
    }
    setEditingItem(null)
    setModalType(null)
  }

  const handleSaveInternship = async (formData: any) => {
    if (editingItem?.id) {
      await update(ref(database, `internships/${editingItem.id}`), formData)
    } else {
      const newId = `internship_${Date.now()}`
      await set(ref(database, `internships/${newId}`), { ...formData, id: newId })
    }
    setEditingItem(null)
    setModalType(null)
  }

  const handleCreate = () => {
    setEditingItem(null)
    setModalType(activeTab)
  }

  const handleEdit = (item: any, id: string) => {
    setEditingItem({ ...item, id })
    setModalType(activeTab)
  }

  const handleDelete = async (id: string) => {
    if (confirm("⚠️ Permanently delete this item?")) {
      await remove(ref(database, `${activeTab}/${id}`))
    }
  }

  const getFilteredData = () => {
    if (activeTab === 'od_requests') {
      return Object.entries(data.od_requests).filter(([_, item]: any) => 
        (data.users[item.userId]?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    const raw = data[activeTab] || {}
    return Object.entries(raw).filter(([_, item]: any) => 
      (item.title || item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden xl:flex flex-col sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-10">
          <Database className="text-indigo-600" size={24} />
          <span className="font-black text-2xl tracking-tighter">EXOSPHERE</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { id: "events", label: "Events", icon: Calendar },
            { id: "od_requests", label: "OD Requests", icon: FileText },
            { id: "users", label: "Students", icon: Users },
            { id: "companies", label: "Companies", icon: Building2 },
            { id: "internships", label: "Internships", icon: Briefcase },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id); setEditingItem(null); setModalType(null) }}
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

        {/* OD Requests Tab */}
        {activeTab === 'od_requests' && (
          <div className="max-w-4xl space-y-5">
            {filteredData.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center text-gray-400">✨ No OD requests found</div>
            )}
            {filteredData.map(([id, req]: any) => (
              <ODRequestItem 
                key={id} 
                request={req} 
                user={data.users[req.userId]} 
                onAction={handleODAction} 
              />
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(data.users).map(([id, user]: any) => {
              if (searchQuery && !user.name?.toLowerCase().includes(searchQuery.toLowerCase()) && 
                  !user.email?.toLowerCase().includes(searchQuery.toLowerCase())) return null
              return (
                <div key={id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-xl">{user.name || "Student"}</h3>
                        <p className="text-gray-500 text-sm">{user.email || "No email"}</p>
                        <p className="text-gray-400 text-xs mt-1">{user.registerNumber || "No register number"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowUserTickets({ ...user, id })} className="p-2 bg-indigo-50 rounded-xl text-indigo-600 hover:bg-indigo-100 transition" title="View Tickets">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => confirm("Delete user?") && remove(ref(database, `users/${id}`))} className="p-2 bg-red-50 rounded-xl text-red-500 hover:bg-red-100 transition" title="Delete User">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge color="purple">Tickets: {user.tickets ? Object.keys(user.tickets).length : 0}</Badge>
                      <Badge color="orange">{user.phone || "No Phone"}</Badge>
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-50">
                      <button onClick={() => addManualTicket(id)} className="w-full bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition">
                        <Ticket size={14} /> Assign Ticket
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {Object.entries(data.events).map(([id, event]: any) => {
              if (searchQuery && !event.title?.toLowerCase().includes(searchQuery.toLowerCase())) return null
              return (
                <div key={id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition group">
                  <div className="h-44 overflow-hidden bg-gray-100">
                    <img src={event.image || PLACEHOLDER_IMAGE} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt={event.title} />
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-lg">{event.title}</h3>
                    <p className="text-indigo-500 text-xs font-semibold mt-1 flex items-center gap-1"><Calendar size={12} /> {new Date(event.dateTime).toLocaleString()}</p>
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1"><MapPin size={12} /> {event.venue}</p>
                    <div className="flex gap-1 mt-2">
                      <Badge color="blue">{event.category}</Badge>
                      <Badge color="green">{event.tickets?.length || 0} Ticket Types</Badge>
                    </div>
                  </div>
                  <div className="flex border-t border-gray-50 divide-x divide-gray-50">
                    <button onClick={() => handleEdit(event, id)} className="flex-1 py-3 text-indigo-600 font-bold text-sm flex items-center justify-center gap-1 hover:bg-indigo-50 transition"><Edit3 size={14} /> Edit</button>
                    <button onClick={() => handleDelete(id)} className="flex-1 py-3 text-red-500 font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-50 transition"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              )
            })}
            <button onClick={handleCreate} className="border-2 border-dashed border-indigo-200 rounded-3xl h-80 flex flex-col items-center justify-center gap-3 text-indigo-500 hover:bg-indigo-50 transition group">
              <Plus size={32} strokeWidth={1.5} className="group-hover:scale-110 transition" />
              <span className="font-bold">Create New Event</span>
            </button>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {Object.entries(data.companies).map(([id, company]: any) => {
              if (searchQuery && !company.name?.toLowerCase().includes(searchQuery.toLowerCase())) return null
              return (
                <div key={id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <img src={company.logoUrl || PLACEHOLDER_IMAGE} className="w-16 h-16 rounded-2xl object-cover" />
                      <div>
                        <h3 className="font-black text-lg">{company.name}</h3>
                        <p className="text-gray-500 text-xs">{company.headquarters}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{company.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge color="blue">Founded {company.foundedYear}</Badge>
                      <Badge color="green">{company.employeeCount}</Badge>
                    </div>
                  </div>
                  <div className="flex border-t border-gray-50 divide-x divide-gray-50">
                    <button onClick={() => handleEdit(company, id)} className="flex-1 py-3 text-indigo-600 font-bold text-sm flex items-center justify-center gap-1 hover:bg-indigo-50 transition"><Edit3 size={14} /> Edit</button>
                    <button onClick={() => handleDelete(id)} className="flex-1 py-3 text-red-500 font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-50 transition"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              )
            })}
            <button onClick={handleCreate} className="border-2 border-dashed border-indigo-200 rounded-3xl h-80 flex flex-col items-center justify-center gap-3 text-indigo-500 hover:bg-indigo-50 transition">
              <Plus size={32} strokeWidth={1.5} />
              <span className="font-bold">Add Company</span>
            </button>
          </div>
        )}

        {/* Internships Tab */}
        {activeTab === 'internships' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {Object.entries(data.internships).map(([id, internship]: any) => {
              if (searchQuery && !internship.title?.toLowerCase().includes(searchQuery.toLowerCase())) return null
              const company = data.companies[internship.companyId]
              return (
                <div key={id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-black text-lg">{internship.title}</h3>
                        <p className="text-indigo-600 text-sm font-semibold">{company?.name || 'Unknown Company'}</p>
                      </div>
                      <Briefcase size={24} className="text-gray-400" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-gray-600"><MapPin size={14} /> {internship.location}</p>
                      <p className="flex items-center gap-2 text-gray-600"><Clock size={14} /> {internship.durationMonths} months · {internship.shiftTiming}</p>
                      <p className="flex items-center gap-2 text-gray-600"><Link size={14} /> <a href={internship.applyUrl} target="_blank" className="text-indigo-600 truncate">Apply Link</a></p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {internship.requiredSkills?.slice(0, 3).map((skill: string, idx: number) => (
                        <Badge key={idx} color="blue">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex border-t border-gray-50 divide-x divide-gray-50">
                    <button onClick={() => handleEdit(internship, id)} className="flex-1 py-3 text-indigo-600 font-bold text-sm flex items-center justify-center gap-1 hover:bg-indigo-50 transition"><Edit3 size={14} /> Edit</button>
                    <button onClick={() => handleDelete(id)} className="flex-1 py-3 text-red-500 font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-50 transition"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              )
            })}
            <button onClick={handleCreate} className="border-2 border-dashed border-indigo-200 rounded-3xl h-80 flex flex-col items-center justify-center gap-3 text-indigo-500 hover:bg-indigo-50 transition">
              <Plus size={32} strokeWidth={1.5} />
              <span className="font-bold">Post Internship</span>
            </button>
          </div>
        )}
      </main>

      {/* Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsScanning(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black">Gate Entry Scanner</h3>
              <button onClick={() => setIsScanning(false)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
            </div>
            <input autoFocus type="text" placeholder="Scan Booking ID" className="w-full py-4 text-center bg-gray-50 rounded-2xl font-mono text-xl border-2 border-indigo-100 focus:border-indigo-400 outline-none" onKeyDown={(e: any) => e.key === 'Enter' && handleQuickCheckIn(e.target.value)} />
            {scanResult?.success && (
              <div className="mt-5 p-4 bg-green-50 rounded-2xl text-center">
                <CheckCircle2 className="mx-auto text-green-600 mb-2" size={32} />
                <p className="font-bold text-green-800">✓ CHECKED IN</p>
                <p className="text-green-600 text-sm">{scanResult.name} - {scanResult.event}</p>
              </div>
            )}
            {scanResult?.error && (
              <div className="mt-5 p-4 bg-red-50 rounded-2xl text-center">
                <AlertCircle className="mx-auto text-red-600 mb-2" size={32} />
                <p className="font-bold text-red-800">{scanResult.error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {modalType === 'events' && (
        <EventModal event={editingItem} onSave={handleSaveEvent} onClose={() => { setModalType(null); setEditingItem(null) }} />
      )}
      {modalType === 'companies' && (
        <CompanyModal company={editingItem} onSave={handleSaveCompany} onClose={() => { setModalType(null); setEditingItem(null) }} />
      )}
      {modalType === 'internships' && (
        <InternshipModal internship={editingItem} companies={data.companies} onSave={handleSaveInternship} onClose={() => { setModalType(null); setEditingItem(null) }} />
      )}

      {/* User Tickets Modal */}
      {showUserTickets && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUserTickets(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
              <h3 className="text-2xl font-black">🎫 {showUserTickets.name}'s Tickets</h3>
              <button onClick={() => setShowUserTickets(null)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
            </div>
            {showUserTickets.tickets && Object.keys(showUserTickets.tickets).length > 0 ? (
              <div className="space-y-3">
                {Object.values(showUserTickets.tickets).map((ticket: any, idx: number) => (
                  <div key={idx} className="border border-gray-100 rounded-2xl p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition" onClick={() => setSelectedTicket(ticket)}>
                    <div>
                      <p className="font-bold text-gray-800">{ticket.eventTitle}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Calendar size={10} /> {new Date(ticket.eventDateTime).toLocaleString()}</p>
                    </div>
                    <Badge color={ticket.status === 'checked_in' ? 'green' : 'blue'}>{ticket.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No tickets assigned yet</p>
            )}
            <button className="w-full mt-5 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2" onClick={() => addManualTicket(showUserTickets.id)}>
              <Plus size={16} /> Assign New Ticket
            </button>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  )
}
