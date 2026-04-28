// components/admin/AdminDashboard.jsx
"use client";

import { useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set, push, update, remove, get } from "firebase/database"
import { 
  LogOut, Plus, Edit3, Trash2, Calendar, Briefcase, Building2, Users, 
  Save, X, Search, Shield, Database, Sparkles, ChevronRight, 
  CheckCircle2, QrCode, FileText, AlertCircle, Phone, Mail, Ticket, 
  Eye, Clock, MapPin, DollarSign, Globe, Award, Link, List, Star,
  School, Navigation, Filter, Download, CreditCard, CheckCircle, 
  AlertTriangle, UserCheck, UserX, Settings, TrendingUp, DollarSign as MoneyIcon,
  BarChart3, PieChart, DownloadCloud, Printer, UserPlus, GraduationCap
} from "lucide-react"
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'

const ADMIN_PIN = "5152"
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop"

// College configurations
const COLLEGES = {
  'srmist': {
    id: 'srmist',
    name: 'SRM Institute of Science and Technology',
    shortName: 'SRMIST',
    location: 'Chennai, Tamil Nadu',
    domain: '@srmist.edu.in',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/SRM_University_logo.svg/1200px-SRM_University_logo.svg.png',
    primaryColor: '#7C3AED'
  },
  'vit': {
    id: 'vit',
    name: 'Vellore Institute of Technology',
    shortName: 'VIT',
    location: 'Vellore, Tamil Nadu',
    domain: '@vit.ac.in',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/VIT_University_Logo.svg/1200px-VIT_University_Logo.svg.png',
    primaryColor: '#F59E0B'
  },
  'anna': {
    id: 'anna',
    name: 'Anna University',
    shortName: 'AU',
    location: 'Chennai, Tamil Nadu',
    domain: '@annauniv.edu',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Anna_University_Logo.svg/1200px-Anna_University_Logo.svg.png',
    primaryColor: '#10B981'
  },
  'mit': {
    id: 'mit',
    name: 'MIT World Peace University',
    shortName: 'MIT-WPU',
    location: 'Pune, Maharashtra',
    domain: '@mitwpu.edu.in',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/MIT_World_Peace_University_logo.png/1200px-MIT_World_Peace_University_logo.png',
    primaryColor: '#EF4444'
  },
  'bits': {
    id: 'bits',
    name: 'BITS Pilani',
    shortName: 'BITS',
    location: 'Pilani, Rajasthan',
    domain: '@pilani.bits-pilani.ac.in',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/51/BITS_Pilani-Logo.svg/1200px-BITS_Pilani-Logo.svg.png',
    primaryColor: '#3B82F6'
  }
}

function Badge({ children, color }: { children: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  }
  return (
    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  )
}

// OD Request Item Component with working approve/reject
function ODRequestItem({ request, user, event, onApprove, onReject }: any) {
  const statusColor = request.status === 'approved' ? 'green' : 
                      request.status === 'rejected' ? 'red' : 'orange'
  const statusText = request.status === 'approved' ? 'Approved' : 
                     request.status === 'rejected' ? 'Rejected' : 'Pending Review'
  const isPending = request.status === 'pending'
  
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row justify-between gap-5">
        <div className="flex gap-5">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <FileText size={26} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h4 className="font-black text-xl text-gray-800">{user?.name || request.userName || "Unknown Student"}</h4>
              <Badge color={statusColor}>{statusText}</Badge>
            </div>
            <p className="text-indigo-600 font-semibold text-sm mb-2 flex items-center gap-1">
              <Calendar size={14} /> {event?.title || request.eventTitle || 'Unknown Event'}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Mail size={12} /> {user?.email || 'No Email'}</span>
              <span className="flex items-center gap-1"><Phone size={12} /> {user?.phone || request.userPhone || 'No Phone'}</span>
              <span className="flex items-center gap-1"><Award size={12} /> {user?.registerNumber || request.registerNumber || 'No Register No'}</span>
              <span className="flex items-center gap-1"><School size={12} /> {user?.collegeName || COLLEGES[user?.collegeId]?.shortName || request.collegeName || 'Unknown College'}</span>
            </div>
            {request.eventDateTime && (
              <p className="text-gray-500 text-xs mt-2 flex items-center gap-1"><Clock size={10} /> Event on: {new Date(request.eventDateTime).toLocaleString()}</p>
            )}
            <p className="text-gray-400 text-xs">Requested: {request.createdAt ? new Date(request.createdAt).toLocaleString() : request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A'}</p>
            {request.reason && <p className="text-gray-500 text-xs mt-1">Reason: {request.reason}</p>}
          </div>
        </div>
        <div className="flex flex-row md:flex-col items-end gap-3 pt-4 md:pt-0">
          <div className="flex gap-2">
            {isPending && (
              <>
                <button 
                  onClick={() => onApprove(request.id, request.userId)} 
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition flex items-center gap-1"
                >
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button 
                  onClick={() => onReject(request.id, request.userId)} 
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition flex items-center gap-1"
                >
                  <X size={14} /> Reject
                </button>
              </>
            )}
            {!isPending && (
              <Badge color={statusColor}>{statusText}</Badge>
            )}
          </div>
        </div>
      </div>
      {request.facultyRemarks && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <span className="font-semibold">Remarks:</span> {request.facultyRemarks}
        </div>
      )}
    </div>
  )
}

// Edit User Modal
function EditUserModal({ user, colleges, onSave, onClose }: { user: any; colleges: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(user || { 
    name: '', email: '', phone: '', registerNumber: '', 
    department: '', year: '', collegeId: 'srmist', collegeName: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'year' ? parseInt(e.target.value) : e.target.value
    setForm({ ...form, [e.target.name]: value })
    
    if (e.target.name === 'collegeId') {
      const college = colleges[e.target.value]
      setForm({ ...form, collegeId: e.target.value, collegeName: college?.name })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-black mb-4">Edit Student Profile</h3>
        <div className="space-y-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="registerNumber" value={form.registerNumber} onChange={handleChange} placeholder="Register Number" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="department" value={form.department} onChange={handleChange} placeholder="Department" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="Year" className="w-full p-3 bg-gray-50 rounded-xl" />
          
          <select name="collegeId" value={form.collegeId} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl">
            {Object.entries(colleges).map(([id, college]: any) => (
              <option key={id} value={id}>{college.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Save Changes</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// Event Statistics Modal
function EventStatisticsModal({ event, onClose, onDownloadAttendance }: { event: any; onClose: () => void; onDownloadAttendance: (eventId: string) => void }) {
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [registeredCount, setRegisteredCount] = useState(0)
  const [checkedInCount, setCheckedInCount] = useState(0)

  useEffect(() => {
    loadEventParticipants()
  }, [event])

  const loadEventParticipants = async () => {
    setLoading(true)
    try {
      const usersRef = ref(database, 'users')
      const snapshot = await get(usersRef)
      const users = snapshot.val() || {}
      
      const regParticipants: any[] = []
      let registered = 0
      let checkedIn = 0
      
      Object.entries(users).forEach(([userId, userData]: any) => {
        if (userData.tickets) {
          Object.entries(userData.tickets).forEach(([ticketId, ticket]: any) => {
            if (ticket.eventId === event.id) {
              registered++
              if (ticket.status === 'checked_in') checkedIn++
              
              regParticipants.push({
                userId,
                name: userData.name,
                email: userData.email,
                registerNumber: userData.registerNumber,
                department: userData.department,
                collegeId: userData.collegeId,
                phone: userData.phone,
                ticketId,
                ticketStatus: ticket.status,
                checkedInAt: ticket.checkedInAt,
                purchaseDate: ticket.createdAt || ticket.purchaseDate
              })
            }
          })
        }
      })
      
      setParticipants(regParticipants)
      setRegisteredCount(registered)
      setCheckedInCount(checkedIn)
    } catch (error) {
      console.error("Error loading participants:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCheckInData = () => {
    const hourly: Record<number, number> = {}
    participants.forEach(p => {
      if (p.ticketStatus === 'checked_in' && p.checkedInAt) {
        const hour = new Date(p.checkedInAt).getHours()
        hourly[hour] = (hourly[hour] || 0) + 1
      }
    })
    return Object.entries(hourly).map(([hour, count]) => ({ hour: `${hour}:00`, count }))
  }

  const getDepartmentData = () => {
    const dept: Record<string, number> = {}
    participants.forEach(p => {
      const deptName = p.department || 'Unknown'
      dept[deptName] = (dept[deptName] || 0) + 1
    })
    return Object.entries(dept).map(([name, value]) => ({ name, value }))
  }

  const COLORS = ['#7C3AED', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899']

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl max-w-4xl w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black">{event.title}</h3>
            <p className="text-gray-500 text-sm mt-1">Event Statistics & Analytics</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-2xl p-4 text-center">
              <Users size={24} className="mx-auto text-indigo-600 mb-2" />
              <p className="text-2xl font-bold">{registeredCount}</p>
              <p className="text-xs text-gray-500">Registered</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center">
              <CheckCircle2 size={24} className="mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">{checkedInCount}</p>
              <p className="text-xs text-gray-500">Checked In</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4 text-center">
              <TrendingUp size={24} className="mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold">{registeredCount ? Math.round((checkedInCount / registeredCount) * 100) : 0}%</p>
              <p className="text-xs text-gray-500">Attendance Rate</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <Calendar size={24} className="mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{new Date(event.dateTime).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">Event Date</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="font-bold mb-4">Check-in Timeline</h4>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={getCheckInData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="font-bold mb-4">Department Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={getDepartmentData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getDepartmentData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">Registered Participants ({participants.length})</h4>
              <button 
                onClick={() => onDownloadAttendance(event.id)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Register No</th>
                    <th className="pb-2">Department</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Check-in Time</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2">{p.name}</td>
                      <td className="py-2">{p.registerNumber}</td>
                      <td className="py-2">{p.department}</td>
                      <td className="py-2">
                        <Badge color={p.ticketStatus === 'checked_in' ? 'green' : 'blue'}>
                          {p.ticketStatus === 'checked_in' ? 'Checked In' : 'Registered'}
                        </Badge>
                      </td>
                      <td className="py-2">{p.checkedInAt ? new Date(p.checkedInAt).toLocaleTimeString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Event Modal
function EventModal({ event, colleges, onSave, onClose }: { event: any; colleges: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(event || { 
    title: '', image: '', category: '', description: '', 
    dateTime: '', venue: '', location: { address: '' }, 
    collegeId: 'srmist', price: 0, odEligible: true,
    tickets: [{ name: 'General Admission', price: 0, quantity: 100 }] 
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'address') {
      setForm({ ...form, location: { ...form.location, address: e.target.value } })
    } else if (e.target.name === 'price') {
      setForm({ ...form, price: parseFloat(e.target.value) || 0 })
    } else if (e.target.name === 'odEligible') {
      setForm({ ...form, odEligible: e.target.value === 'true' })
    } else {
      setForm({ ...form, [e.target.name]: e.target.value })
    }
  }

  const addTicket = () => {
    setForm({ 
      ...form, 
      tickets: [...form.tickets, { name: 'New Ticket', price: 0, quantity: 100 }] 
    })
  }

  const updateTicket = (index: number, field: string, value: string | number) => {
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
          <select name="collegeId" value={form.collegeId} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200">
            <option value="">Select College</option>
            {Object.entries(colleges).map(([id, college]: any) => (
              <option key={id} value={id}>{college.name}</option>
            ))}
          </select>
          
          <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="dateTime" value={form.dateTime} onChange={handleChange} type="datetime-local" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="venue" value={form.venue} onChange={handleChange} placeholder="Venue" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          <input name="address" value={form.location?.address || ''} onChange={handleChange} placeholder="Full Address" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Ticket Price (₹)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0 for free" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">OD Eligible</label>
              <select name="odEligible" value={form.odEligible} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200">
                <option value="true">Yes - OD Available</option>
                <option value="false">No - No OD</option>
              </select>
            </div>
          </div>
          
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200" />
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold">Ticket Types</h4>
              <button type="button" onClick={addTicket} className="text-indigo-600 text-sm font-bold flex items-center gap-1"><Plus size={16}/> Add Ticket Type</button>
            </div>
            {form.tickets.map((ticket: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input value={ticket.name} onChange={(e) => updateTicket(idx, 'name', e.target.value)} placeholder="Ticket name" className="flex-1 p-2 bg-gray-50 rounded-lg text-sm" />
                <input type="number" value={ticket.price} onChange={(e) => updateTicket(idx, 'price', parseFloat(e.target.value) || 0)} placeholder="Price" className="w-24 p-2 bg-gray-50 rounded-lg text-sm" />
                <input type="number" value={ticket.quantity} onChange={(e) => updateTicket(idx, 'quantity', parseInt(e.target.value) || 0)} placeholder="Qty" className="w-20 p-2 bg-gray-50 rounded-lg text-sm" />
                <button onClick={() => removeTicket(idx)} className="p-2 text-red-500"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Save Event</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// Company Modal
function CompanyModal({ company, onSave, onClose }: { company: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(company || { 
    name: '', logoUrl: '', website: '', headquarters: '', 
    foundedYear: '', employeeCount: '', description: '', industry: '' 
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-black mb-4">{company?.id ? 'Edit Company' : 'Add Company'}</h3>
        <div className="space-y-3">
          <input name="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Company Name" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="logoUrl" value={form.logoUrl} onChange={(e) => setForm({...form, logoUrl: e.target.value})} placeholder="Logo URL" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="website" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} placeholder="Website" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="industry" value={form.industry} onChange={(e) => setForm({...form, industry: e.target.value})} placeholder="Industry" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="headquarters" value={form.headquarters} onChange={(e) => setForm({...form, headquarters: e.target.value})} placeholder="Headquarters" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="foundedYear" value={form.foundedYear} onChange={(e) => setForm({...form, foundedYear: e.target.value})} placeholder="Founded Year" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="employeeCount" value={form.employeeCount} onChange={(e) => setForm({...form, employeeCount: e.target.value})} placeholder="Employee Count" className="w-full p-3 bg-gray-50 rounded-xl" />
          <textarea name="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" rows={3} className="w-full p-3 bg-gray-50 rounded-xl" />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Save</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// Internship Modal
function InternshipModal({ internship, companies, onSave, onClose }: { internship: any; companies: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(internship || { 
    companyId: '', title: '', category: '', location: '', type: 'Internship', 
    durationMonths: '3', stipend: '', applyUrl: '', responsibilities: [], requiredSkills: [] 
  })
  const [newResponsibility, setNewResponsibility] = useState('')
  const [newSkill, setNewSkill] = useState('')

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
        <h3 className="text-2xl font-black mb-4">{internship?.id ? 'Edit Internship' : 'Post Internship'}</h3>
        <div className="space-y-3">
          <select name="companyId" value={form.companyId} onChange={(e) => setForm({...form, companyId: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl">
            <option value="">Select Company</option>
            {Object.entries(companies).map(([id, company]: any) => (
              <option key={id} value={id}>{company.name}</option>
            ))}
          </select>
          <input name="title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Internship Title" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="Category" className="w-full p-3 bg-gray-50 rounded-xl" />
          <input name="location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} placeholder="Location" className="w-full p-3 bg-gray-50 rounded-xl" />
          <select name="type" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl">
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
          <div className="flex gap-3">
            <input name="durationMonths" value={form.durationMonths} onChange={(e) => setForm({...form, durationMonths: e.target.value})} placeholder="Duration (months)" className="flex-1 p-3 bg-gray-50 rounded-xl" />
            <input name="stipend" value={form.stipend} onChange={(e) => setForm({...form, stipend: e.target.value})} placeholder="Stipend (₹)" className="flex-1 p-3 bg-gray-50 rounded-xl" />
          </div>
          <input name="applyUrl" value={form.applyUrl} onChange={(e) => setForm({...form, applyUrl: e.target.value})} placeholder="Application URL" className="w-full p-3 bg-gray-50 rounded-xl" />
          
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

// Ticket Modal
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
          <p><span className="font-bold text-gray-600">Date/Time:</span> {ticket.eventDateTime ? new Date(ticket.eventDateTime).toLocaleString() : 'TBA'}</p>
          <p><span className="font-bold text-gray-600">Venue:</span> {ticket.venue || 'TBD'}</p>
          <p><span className="font-bold text-gray-600">Status:</span> <Badge color={ticket.status === 'checked_in' ? 'green' : 'blue'}>{ticket.status || 'active'}</Badge></p>
          <p><span className="font-bold text-gray-600">Total Paid:</span> <span className="text-green-600 font-bold">₹{ticket.totalPaid || 0}</span></p>
          <p><span className="font-bold text-gray-600">Quantity:</span> {ticket.quantity || 1} ticket(s)</p>
          <p><span className="font-bold text-gray-600">Purchased:</span> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Close</button>
        </div>
      </div>
    </div>
  )
}

// Main Admin Dashboard
export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [modalType, setModalType] = useState<string | null>(null)
  const [data, setData] = useState<any>({ 
    events: {}, companies: {}, internships: {}, users: {}, odRequests: {}, odRequestsOld: {}
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [selectedEventForStats, setSelectedEventForStats] = useState<any>(null)
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState("all")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTickets: 0,
    totalODRequests: 0,
    revenue: 0,
    pendingODs: 0
  })

  // Load data from Firebase
  useEffect(() => {
    const eventsRef = ref(database, 'events')
    const unsubscribeEvents = onValue(eventsRef, (snap) => {
      const events = snap.val() || {}
      setData((prev: any) => ({ ...prev, events }))
      setStats(prev => ({ ...prev, totalEvents: Object.keys(events).length }))
    })

    const companiesRef = ref(database, 'companies')
    const unsubscribeCompanies = onValue(companiesRef, (snap) => {
      setData((prev: any) => ({ ...prev, companies: snap.val() || {} }))
    })

    const internshipsRef = ref(database, 'internships')
    const unsubscribeInternships = onValue(internshipsRef, (snap) => {
      setData((prev: any) => ({ ...prev, internships: snap.val() || {} }))
    })

    const odRequestsRef = ref(database, 'odRequests')
    const unsubscribeODRequests = onValue(odRequestsRef, (snap) => {
      const odRequests = snap.val() || {}
      setData((prev: any) => ({ ...prev, odRequests }))
    })

    const odRequestsOldRef = ref(database, 'od_requests')
    const unsubscribeODRequestsOld = onValue(odRequestsOldRef, (snap) => {
      const odRequestsOld = snap.val() || {}
      setData((prev: any) => ({ ...prev, odRequestsOld }))
    })

    const usersRef = ref(database, 'users')
    const unsubscribeUsers = onValue(usersRef, (snap) => {
      const users = snap.val() || {}
      setData((prev: any) => ({ ...prev, users }))
      
      let totalTickets = 0
      let totalRevenue = 0
      let pendingODs = 0
      
      Object.entries(users).forEach(([, userData]: any) => {
        if (userData.tickets) {
          const tickets = Object.values(userData.tickets)
          totalTickets += tickets.length
          totalRevenue += tickets.reduce((sum: number, ticket: any) => sum + (ticket.totalPaid || 0), 0)
        }
        if (userData.odRequests) {
          pendingODs += Object.values(userData.odRequests).filter((req: any) => req.status === 'pending').length
        }
        if (userData.od_requests) {
          pendingODs += Object.values(userData.od_requests).filter((req: any) => req.status === 'pending').length
        }
      })
      
      setStats(prev => ({
        ...prev,
        totalUsers: Object.keys(users).length,
        totalTickets,
        revenue: totalRevenue,
        pendingODs
      }))
    })

    return () => {
      unsubscribeEvents()
      unsubscribeCompanies()
      unsubscribeInternships()
      unsubscribeUsers()
      unsubscribeODRequests()
      unsubscribeODRequestsOld()
    }
  }, [])

  // Combine all OD requests
  const getAllODRequests = () => {
    const allRequests: any = {}
    
    // From odRequests collection
    Object.entries(data.odRequests).forEach(([id, req]: any) => {
      allRequests[id] = { ...req, id, source: 'odRequests' }
    })
    
    // From od_requests collection
    Object.entries(data.odRequestsOld).forEach(([id, req]: any) => {
      const key = `old_${id}`
      allRequests[key] = { ...req, id: key, originalId: id, source: 'od_requests' }
    })
    
    // From users' nested odRequests
    Object.entries(data.users).forEach(([userId, user]: any) => {
      if (user.odRequests) {
        Object.entries(user.odRequests).forEach(([odId, req]: any) => {
          const uniqueId = `user_${userId}_${odId}`
          allRequests[uniqueId] = { ...req, id: uniqueId, userId, originalOdId: odId, source: 'user_odRequests' }
        })
      }
      if (user.od_requests) {
        Object.entries(user.od_requests).forEach(([odId, req]: any) => {
          const uniqueId = `user_${userId}_${odId}`
          if (!allRequests[uniqueId]) {
            allRequests[uniqueId] = { ...req, id: uniqueId, userId, originalOdId: odId, source: 'user_od_requests' }
          }
        })
      }
    })
    
    return allRequests
  }

  // FIXED: Approve OD Request - Works for all locations
  const handleApproveOD = async (requestId: string, userId: string) => {
    try {
      const allODs = getAllODRequests()
      const request = allODs[requestId]
      
      if (!request) {
        alert("Request not found!")
        return
      }
      
      // Handle based on source
      if (request.source === 'odRequests') {
        await update(ref(database, `odRequests/${requestId}`), { 
          status: 'approved',
          reviewedAt: Date.now(),
          reviewedBy: 'admin'
        })
      } 
      else if (request.source === 'od_requests') {
        await update(ref(database, `od_requests/${request.originalId}`), { 
          status: 'approved',
          reviewedAt: Date.now(),
          reviewedBy: 'admin'
        })
      }
      else if (request.source === 'user_odRequests' && userId) {
        await update(ref(database, `users/${userId}/odRequests/${request.originalOdId}`), { 
          status: 'approved',
          reviewedAt: Date.now(),
          reviewedBy: 'admin'
        })
      }
      else if (request.source === 'user_od_requests' && userId) {
        await update(ref(database, `users/${userId}/od_requests/${request.originalOdId}`), { 
          status: 'approved',
          reviewedAt: Date.now(),
          reviewedBy: 'admin'
        })
      }
      else {
        // Try fallback - search in user's odRequests
        const userRef = ref(database, `users/${userId}`)
        const userSnap = await get(userRef)
        const userData = userSnap.val()
        
        let found = false
        if (userData?.odRequests) {
          const odEntry = Object.entries(userData.odRequests).find(([_, req]: any) => req.status === 'pending')
          if (odEntry) {
            await update(ref(database, `users/${userId}/odRequests/${odEntry[0]}`), { status: 'approved' })
            found = true
          }
        }
        if (!found && userData?.od_requests) {
          const odEntry = Object.entries(userData.od_requests).find(([_, req]: any) => req.status === 'pending')
          if (odEntry) {
            await update(ref(database, `users/${userId}/od_requests/${odEntry[0]}`), { status: 'approved' })
            found = true
          }
        }
        if (!found) {
          alert("Could not find OD request to update")
          return
        }
      }
      
      alert("✅ OD Request Approved successfully!")
      
      // Refresh data
      const usersRef = ref(database, 'users')
      const usersSnap = await get(usersRef)
      setData((prev: any) => ({ ...prev, users: usersSnap.val() || {} }))
      
    } catch (error) {
      console.error("Error approving OD request:", error)
      alert("Failed to approve OD request. Please try again.")
    }
  }

  // FIXED: Reject OD Request - Works for all locations
  const handleRejectOD = async (requestId: string, userId: string) => {
    try {
      const allODs = getAllODRequests()
      const request = allODs[requestId]
      
      if (!request) {
        alert("Request not found!")
        return
      }
      
      // Handle based on source
      if (request.source === 'odRequests') {
        await update(ref(database, `odRequests/${requestId}`), { 
          status: 'rejected',
          reviewedAt: Date.now(),
          reviewedBy: 'admin'
        })
      } 
      else if (request.source === 'od_requests') {
        await update(ref(database, `od_requests/${request.originalId}`), { 
          status: 'rejected',
          reviewedAt: Date.now(),
          reviewedBy: 'admin'
        })
      }
      else if (request.source === 'user_odRequests' && userId) {
        await update(ref(database, `users/${userId}/odRequests/${request.originalOdId}`), { 
          status: 'rejected',
          reviewedAt: Date.now(),
          reviewedBy: 'admin'
        })
      }
      else if (request.source === 'user_od_requests' && userId) {
        await update(ref(database, `users/${userId}/od_requests/${request.originalOdId}`), { 
          status: 'rejected',
          reviewedAt: Date.now(),
          reviewedBy: 'admin'
        })
      }
      else {
        // Try fallback - search in user's odRequests
        const userRef = ref(database, `users/${userId}`)
        const userSnap = await get(userRef)
        const userData = userSnap.val()
        
        let found = false
        if (userData?.odRequests) {
          const odEntry = Object.entries(userData.odRequests).find(([_, req]: any) => req.status === 'pending')
          if (odEntry) {
            await update(ref(database, `users/${userId}/odRequests/${odEntry[0]}`), { status: 'rejected' })
            found = true
          }
        }
        if (!found && userData?.od_requests) {
          const odEntry = Object.entries(userData.od_requests).find(([_, req]: any) => req.status === 'pending')
          if (odEntry) {
            await update(ref(database, `users/${userId}/od_requests/${odEntry[0]}`), { status: 'rejected' })
            found = true
          }
        }
        if (!found) {
          alert("Could not find OD request to update")
          return
        }
      }
      
      alert("❌ OD Request Rejected!")
      
      // Refresh data
      const usersRef = ref(database, 'users')
      const usersSnap = await get(usersRef)
      setData((prev: any) => ({ ...prev, users: usersSnap.val() || {} }))
      
    } catch (error) {
      console.error("Error rejecting OD request:", error)
      alert("Failed to reject OD request. Please try again.")
    }
  }

  const handleUpdateUser = async (updatedUser: any) => {
    try {
      const userId = updatedUser.id
      const updateData = { ...updatedUser }
      delete updateData.id
      delete updateData.tickets
      delete updateData.odRequests
      delete updateData.od_requests
      
      await update(ref(database, `users/${userId}`), updateData)
      alert(`User ${updatedUser.name} updated successfully!`)
      setEditingUser(null)
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Failed to update user")
    }
  }

  const handleAssignTicket = async (userId: string) => {
    const eventId = prompt("Enter Event ID:")
    if (!eventId) return
    
    const event = data.events[eventId]
    if (!event) {
      alert("Event not found!")
      return
    }

    const bookingId = "BK" + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase()
    const userData = data.users[userId]
    
    const ticketData = {
      bookingId,
      eventId,
      eventTitle: event.title,
      eventImage: event.image,
      eventDateTime: event.dateTime,
      venue: event.venue,
      createdAt: Date.now(),
      totalPaid: event.price || 0,
      quantity: 1,
      status: "active",
      assignedBy: "admin"
    }
    
    await set(ref(database, `users/${userId}/tickets/${bookingId}`), ticketData)
    alert(`✅ Ticket ${bookingId} assigned to ${userData?.name || 'student'}`)
  }

  const handleDownloadAttendance = async (eventId: string) => {
    const event = data.events[eventId]
    if (!event) return
    
    const usersRef = ref(database, 'users')
    const snapshot = await get(usersRef)
    const users = snapshot.val() || {}
    
    const participants: any[] = []
    
    Object.entries(users).forEach(([userId, userData]: any) => {
      if (userData.tickets) {
        Object.entries(userData.tickets).forEach(([ticketId, ticket]: any) => {
          if (ticket.eventId === eventId) {
            participants.push({
              'Name': userData.name,
              'Email': userData.email,
              'Register Number': userData.registerNumber,
              'Department': userData.department,
              'Phone': userData.phone,
              'Status': ticket.status === 'checked_in' ? 'Checked In' : 'Registered',
              'Check-in Time': ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleString() : '-',
              'Booking ID': ticket.bookingId
            })
          }
        })
      }
    })
    
    const headers = Object.keys(participants[0] || {})
    const csvRows = [
      headers.join(','),
      ...participants.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ]
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title}_attendance_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleQuickCheckIn = async (bookingId: string) => {
    setScanResult({ loading: true })
    let found = false

    for (const [uid, user] of Object.entries(data.users) as any) {
      if (user.tickets && user.tickets[bookingId]) {
        const ticket = user.tickets[bookingId]
        if (ticket.status === 'checked_in') {
          setScanResult({ error: "Already checked in", name: user.name, event: ticket.eventTitle })
          found = true
          break
        }
        
        await update(ref(database, `users/${uid}/tickets/${bookingId}`), { 
          status: 'checked_in',
          checkedInAt: Date.now(),
          checkedInBy: 'admin'
        })

        setScanResult({ success: true, name: user.name, event: ticket.eventTitle })
        found = true
        break
      }
    }
    if (!found) setScanResult({ error: "Invalid Booking ID" })
    
    setTimeout(() => {
      setScanResult(null)
    }, 3000)
  }

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

  const handleDelete = async (collection: string, id: string) => {
    if (confirm(`⚠️ Delete this permanently?`)) {
      await remove(ref(database, `${collection}/${id}`))
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`⚠️ Delete user "${userName}" and all their data? This cannot be undone.`)) {
      await remove(ref(database, `users/${userId}`))
      alert(`User ${userName} deleted`)
    }
  }

  const handleEdit = (item: any, id: string) => {
    setEditingItem({ ...item, id })
    setModalType(activeTab)
  }

  const getFilteredData = () => {
    if (activeTab === 'odRequests') {
      const allODs = getAllODRequests()
      let requests = Object.entries(allODs)
      
      if (searchQuery) {
        requests = requests.filter(([_, req]: any) => {
          const user = data.users[req.userId]
          return (user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                 (req.eventTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
        })
      }
      if (selectedCollegeFilter !== 'all') {
        requests = requests.filter(([_, req]: any) => 
          data.users[req.userId]?.collegeId === selectedCollegeFilter
        )
      }
      return requests
    }
    
    if (activeTab === 'users') {
      let users = Object.entries(data.users)
      if (searchQuery) {
        users = users.filter(([_, user]: any) => 
          (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.registerNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      if (selectedCollegeFilter !== 'all') {
        users = users.filter(([_, user]: any) => user.collegeId === selectedCollegeFilter)
      }
      return users
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
          <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-500 mb-6">Exosphere Command Center</p>
          <form onSubmit={(e) => { e.preventDefault(); if(pin === ADMIN_PIN) setAuthenticated(true); else alert("Wrong PIN") }}>
            <input 
              type="password" 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              className="w-full text-center text-4xl py-5 bg-gray-50 rounded-3xl mb-8 outline-none focus:ring-2 focus:ring-indigo-200" 
              placeholder="****" 
              maxLength={4} 
              autoFocus 
            />
            <button className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl hover:bg-indigo-700 transition">ACCESS DASHBOARD</button>
          </form>
        </div>
      </div>
    )
  }

  const filteredData = getFilteredData()
  const allODs = getAllODRequests()
  const totalODs = Object.keys(allODs).length
  const pendingODs = Object.values(allODs).filter((req: any) => 
    req.status === 'pending'
  ).length

  const sidebarTabs = [
    { id: "overview", label: "Overview", icon: Database },
    { id: "events", label: "Events", icon: Calendar },
    { id: "odRequests", label: "OD Requests", icon: FileText },
    { id: "users", label: "Students", icon: Users },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "internships", label: "Internships", icon: Briefcase },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden xl:flex flex-col sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={20} />
          </div>
          <span className="font-black text-2xl tracking-tighter">EXOSPHERE</span>
          <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {sidebarTabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id); setEditingItem(null); setModalType(null) }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="space-y-3">
          <button 
            onClick={() => setIsScanning(true)} 
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition"
          >
            <QrCode size={18} /> GATE SCANNER
          </button>
          
          <button 
            onClick={() => setAuthenticated(false)}
            className="w-full bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 capitalize flex items-center gap-2">
              {activeTab === 'odRequests' ? 'OD Requests' : activeTab}
              {activeTab === 'overview' && <Sparkles className="text-yellow-500" size={28} />}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {activeTab === 'overview' && 'Monitor platform activity and manage content'}
              {activeTab === 'odRequests' && `Review and approve On-Duty requests from students (${totalODs} total, ${pendingODs} pending)`}
              {activeTab === 'users' && 'Manage student accounts, edit profiles, and issue tickets'}
              {activeTab === 'events' && 'Create and manage campus events with statistics tracking'}
              {activeTab === 'companies' && 'Manage partner companies'}
              {activeTab === 'internships' && 'Post and manage internship opportunities'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {(activeTab === 'users' || activeTab === 'odRequests') && (
              <select 
                value={selectedCollegeFilter} 
                onChange={(e) => setSelectedCollegeFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium"
              >
                <option value="all">All Colleges</option>
                {Object.entries(COLLEGES).map(([id, college]: any) => (
                  <option key={id} value={id}>{college.shortName}</option>
                ))}
              </select>
            )}
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 text-sm" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            
            {activeTab !== 'overview' && activeTab !== 'odRequests' && activeTab !== 'users' && (
              <button 
                onClick={() => { setEditingItem(null); setModalType(activeTab) }} 
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition"
              >
                <Plus size={16} /> Create New
              </button>
            )}
          </div>
        </header>

        {/* Overview Dashboard */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Total Students</p>
                    <p className="text-3xl font-black text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Users className="text-indigo-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Total Events</p>
                    <p className="text-3xl font-black text-gray-900">{stats.totalEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                    <Calendar className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Tickets Sold</p>
                    <p className="text-3xl font-black text-gray-900">{stats.totalTickets}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                    <Ticket className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">OD Requests</p>
                    <p className="text-3xl font-black text-gray-900">{totalODs}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
                    <FileText className="text-yellow-600" size={24} />
                  </div>
                </div>
                <p className="text-xs text-orange-500 mt-2">{pendingODs} pending approval</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl flex items-center gap-2">
                  <FileText size={20} /> Recent OD Requests
                  <Badge color="orange">{pendingODs} pending</Badge>
                </h3>
                <button onClick={() => setActiveTab('odRequests')} className="text-indigo-600 text-sm font-bold">View All →</button>
              </div>
              
              {Object.values(allODs).filter((req: any) => req.status === 'pending').slice(0, 5).length > 0 ? (
                <div className="space-y-3">
                  {Object.values(allODs)
                    .filter((req: any) => req.status === 'pending')
                    .slice(0, 5)
                    .map((req: any, idx: number) => {
                      const user = data.users[req.userId]
                      const event = data.events[req.eventId]
                      return (
                        <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                          <div>
                            <p className="font-bold text-gray-800">{user?.name || req.userName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{event?.title || req.eventTitle}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveOD(req.id, req.userId)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg">Approve</button>
                            <button onClick={() => handleRejectOD(req.id, req.userId)} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg">Reject</button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No pending OD requests ✨</p>
              )}
            </div>
            
           // Inside the Overview Dashboard section, replace the College-wise Statistics part:

<div className="bg-white rounded-3xl p-6 border border-gray-100">
  <h3 className="font-black text-xl mb-4">College-wise Statistics</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
    {Object.entries(COLLEGES).map(([id, college]: any) => {
      const collegeUsers = Object.values(data.users).filter((user: any) => user.collegeId === id).length
      return (
        <div key={id} className="text-center p-4 bg-gray-50 rounded-2xl hover:shadow-md transition">
          <img src={college.logo} alt={college.name} className="w-16 h-16 mx-auto mb-3 rounded-full object-contain" />
          <p className="font-bold text-sm">{college.name}</p>
          <p className="text-xs text-gray-500 mt-1">📍 {college.location}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-indigo-600">{collegeUsers}</span>
            <span className="text-xs text-gray-400">students</span>
          </div>
        </div>
      )
    })}
  </div>
</div>

        {/* OD Requests Tab - WITH WORKING APPROVE/REJECT */}
        {activeTab === 'odRequests' && (
          <div className="space-y-5">
            {filteredData.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400">✨ No OD requests found</p>
                <p className="text-gray-300 text-sm mt-2">OD requests will appear here when students apply</p>
              </div>
            ) : (
              filteredData.map(([id, req]: any) => {
                const user = data.users[req.userId]
                const event = data.events[req.eventId]
                return (
                  <ODRequestItem 
                    key={id} 
                    request={req} 
                    user={user} 
                    event={event}
                    onApprove={handleApproveOD}
                    onReject={handleRejectOD}
                  />
                )
              })
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map(([id, user]: any) => {
              const tickets = user.tickets ? Object.values(user.tickets) : []
              const odRequests = [...(user.odRequests ? Object.values(user.odRequests) : []), ...(user.od_requests ? Object.values(user.od_requests) : [])]
              const college = COLLEGES[user.collegeId]
              
              return (
                <div key={id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-xl">{user.name || "Student"}</h3>
                        <p className="text-gray-500 text-sm">{user.email || "No email"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {college && (
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <School size={10} /> {college.shortName}
                            </span>
                          )}
                          <p className="text-gray-400 text-xs">{user.registerNumber || "No register number"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingUser({ ...user, id })} className="p-2 bg-indigo-50 rounded-xl text-indigo-600 hover:bg-indigo-100 transition" title="Edit User">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteUser(id, user.name)} className="p-2 bg-red-50 rounded-xl text-red-500 hover:bg-red-100 transition" title="Delete User">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Badge color="purple">🎫 {tickets.length} Tickets</Badge>
                      <Badge color="orange">📋 {odRequests.length} OD Requests</Badge>
                      <Badge color="green">{user.department || "No Dept"}</Badge>
                    </div>
                    
                    {tickets.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Recent Tickets:</p>
                        <div className="space-y-1">
                          {tickets.slice(0, 2).map((ticket: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">{ticket.eventTitle?.slice(0, 30)}</span>
                              <Badge color={ticket.status === 'checked_in' ? 'green' : 'blue'}>{ticket.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => setSelectedUser({ ...user, id })} className="flex-1 bg-indigo-50 text-indigo-600 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition">
                        <Eye size={14} /> View Details
                      </button>
                      <button onClick={() => handleAssignTicket(id)} className="flex-1 bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition">
                        <Plus size={14} /> Assign Ticket
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
            {filteredData.map(([id, event]: any) => {
              const college = COLLEGES[event.collegeId]
              return (
                <div key={id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition group">
                  <div className="h-44 overflow-hidden bg-gray-100 relative">
                    <img src={event.image || PLACEHOLDER_IMAGE} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt={event.title} />
                    <div className="absolute top-3 left-3">
                      {college && (
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                          <img src={college.logo} className="w-4 h-4 rounded-full" />
                          <span className="text-white text-[10px] font-bold">{college.shortName}</span>
                        </div>
                      )}
                    </div>
                    {event.price > 0 ? (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-lg px-2 py-1 text-xs font-bold">
                        ₹{event.price}
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-purple-500 text-white rounded-lg px-2 py-1 text-xs font-bold">
                        FREE
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-lg">{event.title}</h3>
                    <p className="text-indigo-500 text-xs font-semibold mt-1 flex items-center gap-1">
                      <Calendar size={12} /> {event.dateTime ? new Date(event.dateTime).toLocaleString() : 'TBA'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1"><MapPin size={12} /> {event.venue}</p>
                    <div className="flex gap-1 mt-2">
                      <Badge color="blue">{event.category}</Badge>
                      <Badge color={event.odEligible ? 'green' : 'gray'}>{event.odEligible ? 'OD Eligible' : 'No OD'}</Badge>
                    </div>
                  </div>
                  <div className="flex border-t border-gray-50 divide-x divide-gray-50">
                    <button onClick={() => setSelectedEventForStats(event)} className="flex-1 py-3 text-green-600 font-bold text-sm flex items-center justify-center gap-1 hover:bg-green-50 transition">
                      <BarChart3 size={14} /> Stats
                    </button>
                    <button onClick={() => handleEdit(event, id)} className="flex-1 py-3 text-indigo-600 font-bold text-sm flex items-center justify-center gap-1 hover:bg-indigo-50 transition"><Edit3 size={14} /> Edit</button>
                    <button onClick={() => handleDelete('events', id)} className="flex-1 py-3 text-red-500 font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-50 transition"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              )
            })}
            <button onClick={() => { setEditingItem(null); setModalType('events') }} className="border-2 border-dashed border-indigo-200 rounded-3xl h-96 flex flex-col items-center justify-center gap-3 text-indigo-500 hover:bg-indigo-50 transition group">
              <Plus size={32} strokeWidth={1.5} className="group-hover:scale-110 transition" />
              <span className="font-bold">Create New Event</span>
            </button>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {filteredData.map(([id, company]: any) => (
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
                    <Badge color="green">{company.employeeCount} employees</Badge>
                    <Badge color="purple">{company.industry}</Badge>
                  </div>
                </div>
                <div className="flex border-t border-gray-50 divide-x divide-gray-50">
                  <button onClick={() => handleEdit(company, id)} className="flex-1 py-3 text-indigo-600 font-bold text-sm flex items-center justify-center gap-1 hover:bg-indigo-50 transition"><Edit3 size={14} /> Edit</button>
                  <button onClick={() => handleDelete('companies', id)} className="flex-1 py-3 text-red-500 font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-50 transition"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            ))}
            <button onClick={() => { setEditingItem(null); setModalType('companies') }} className="border-2 border-dashed border-indigo-200 rounded-3xl h-96 flex flex-col items-center justify-center gap-3 text-indigo-500 hover:bg-indigo-50 transition">
              <Plus size={32} strokeWidth={1.5} />
              <span className="font-bold">Add Company</span>
            </button>
          </div>
        )}

        {/* Internships Tab */}
        {activeTab === 'internships' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {filteredData.map(([id, internship]: any) => {
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
                      <p className="flex items-center gap-2 text-gray-600"><Clock size={14} /> {internship.durationMonths} months</p>
                      {internship.stipend && <p className="flex items-center gap-2 text-green-600"><MoneyIcon size={14} /> ₹{internship.stipend}/month</p>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {internship.requiredSkills?.slice(0, 3).map((skill: string, idx: number) => (
                        <Badge key={idx} color="blue">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex border-t border-gray-50 divide-x divide-gray-50">
                    <button onClick={() => handleEdit(internship, id)} className="flex-1 py-3 text-indigo-600 font-bold text-sm flex items-center justify-center gap-1 hover:bg-indigo-50 transition"><Edit3 size={14} /> Edit</button>
                    <button onClick={() => handleDelete('internships', id)} className="flex-1 py-3 text-red-500 font-bold text-sm flex items-center justify-center gap-1 hover:bg-red-50 transition"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              )
            })}
            <button onClick={() => { setEditingItem(null); setModalType('internships') }} className="border-2 border-dashed border-indigo-200 rounded-3xl h-96 flex flex-col items-center justify-center gap-3 text-indigo-500 hover:bg-indigo-50 transition">
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
              <h3 className="text-2xl font-black flex items-center gap-2">
                <QrCode className="text-indigo-600" /> Gate Scanner
              </h3>
              <button onClick={() => setIsScanning(false)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
            </div>
            <p className="text-gray-500 text-sm mb-4">Scan or enter the Booking ID for check-in</p>
            <input 
              autoFocus 
              type="text" 
              placeholder="Enter Booking ID" 
              className="w-full py-4 px-4 text-center bg-gray-50 rounded-2xl font-mono text-lg border-2 border-indigo-100 focus:border-indigo-400 outline-none" 
              onKeyDown={(e: any) => e.key === 'Enter' && handleQuickCheckIn(e.target.value)} 
            />
            
            {scanResult?.success && (
              <div className="mt-5 p-4 bg-green-50 rounded-2xl text-center">
                <CheckCircle2 className="mx-auto text-green-600 mb-2" size={32} />
                <p className="font-bold text-green-800">✓ CHECKED IN</p>
                <p className="text-green-600 text-sm">{scanResult.name} - {scanResult.event}</p>
              </div>
            )}
            
            {scanResult?.error && (
              <div className="mt-5 p-4 bg-red-50 rounded-2xl text-center">
                <AlertTriangle className="mx-auto text-red-600 mb-2" size={32} />
                <p className="font-bold text-red-800">{scanResult.error}</p>
                {scanResult.name && <p className="text-red-600 text-sm">{scanResult.name} - {scanResult.event}</p>}
              </div>
            )}
            
            {scanResult?.loading && (
              <div className="mt-5 p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Verifying...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          colleges={COLLEGES} 
          onSave={handleUpdateUser} 
          onClose={() => setEditingUser(null)} 
        />
      )}

      {/* Event Statistics Modal */}
      {selectedEventForStats && (
        <EventStatisticsModal 
          event={selectedEventForStats} 
          onClose={() => setSelectedEventForStats(null)} 
          onDownloadAttendance={handleDownloadAttendance}
        />
      )}

      {/* Modals */}
      {modalType === 'events' && (
        <EventModal event={editingItem} colleges={COLLEGES} onSave={handleSaveEvent} onClose={() => { setModalType(null); setEditingItem(null) }} />
      )}
      {modalType === 'companies' && (
        <CompanyModal company={editingItem} onSave={handleSaveCompany} onClose={() => { setModalType(null); setEditingItem(null) }} />
      )}
      {modalType === 'internships' && (
        <InternshipModal internship={editingItem} companies={data.companies} onSave={handleSaveInternship} onClose={() => { setModalType(null); setEditingItem(null) }} />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
              <h3 className="text-2xl font-black">👤 {selectedUser.name}'s Profile</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-bold mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Name:</span> {selectedUser.name}</div>
                  <div><span className="text-gray-500">Email:</span> {selectedUser.email}</div>
                  <div><span className="text-gray-500">Register No:</span> {selectedUser.registerNumber || 'Not set'}</div>
                  <div><span className="text-gray-500">Phone:</span> {selectedUser.phone || 'Not set'}</div>
                  <div><span className="text-gray-500">Department:</span> {selectedUser.department || 'Not set'}</div>
                  <div><span className="text-gray-500">Year:</span> {selectedUser.year || 'Not set'}</div>
                  <div><span className="text-gray-500">College:</span> {selectedUser.collegeName || COLLEGES[selectedUser.collegeId]?.name || 'Not set'}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-bold mb-3">🎫 Tickets ({selectedUser.tickets ? Object.keys(selectedUser.tickets).length : 0})</h4>
                {selectedUser.tickets && Object.values(selectedUser.tickets).length > 0 ? (
                  <div className="space-y-2">
                    {Object.values(selectedUser.tickets).map((ticket: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl cursor-pointer hover:bg-indigo-50 transition" onClick={() => setSelectedTicket(ticket)}>
                        <div>
                          <p className="font-semibold text-sm">{ticket.eventTitle}</p>
                          <p className="text-xs text-gray-500">{ticket.eventDateTime ? new Date(ticket.eventDateTime).toLocaleDateString() : 'TBA'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge color={ticket.status === 'checked_in' ? 'green' : 'blue'}>{ticket.status || 'active'}</Badge>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No tickets assigned yet</p>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-bold mb-3">📋 OD Requests</h4>
                <div className="space-y-2">
                  {(() => {
                    const allUserODs = [...(selectedUser.odRequests ? Object.values(selectedUser.odRequests) : []), ...(selectedUser.od_requests ? Object.values(selectedUser.od_requests) : [])]
                    if (allUserODs.length > 0) {
                      return allUserODs.map((request: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl">
                          <div>
                            <p className="font-semibold text-sm">{request.eventTitle}</p>
                            <p className="text-xs text-gray-500">Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge color={request.status === 'approved' ? 'green' : request.status === 'rejected' ? 'red' : 'orange'}>
                            {request.status || 'pending'}
                          </Badge>
                        </div>
                      ))
                    } else {
                      return <p className="text-gray-400 text-center py-4">No OD requests yet</p>
                    }
                  })()}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button onClick={() => handleAssignTicket(selectedUser.id)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                Assign New Ticket
              </button>
              <button onClick={() => setSelectedUser(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  )
}
