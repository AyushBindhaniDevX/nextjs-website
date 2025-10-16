"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, onValue, remove, set, push } from "firebase/database"
import { LogOut, Plus, Edit, Trash2, Calendar, Briefcase, Building2, Users, Save, X, Search, BarChart3, MapPin } from "lucide-react"

const PIN = "5152"
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200.png/e0e0e0/000000?text=No+Image"

// --- Helper Functions & Components ---

const formatCount = (data: any): number => data ? Object.keys(data).length : 0;

function StatCard({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) {
  return (
    <div className="bg-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_#000]">
      <div>
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <p className="text-3xl font-black text-black">{value}</p>
      </div>
      <Icon className="h-8 w-8 text-black mt-2" />
    </div>
  )
}

const arrayToString = (arr: string[] | undefined) => arr?.join('\n') || '';
const stringToArray = (str: string | undefined) => str ? str.split('\n').map(s => s.trim()).filter(Boolean) : [];

// --- Enhanced EditForm Component ---
function EditForm({ type, data, companies, onSave, onCancel }: {
  type: string
  data: any
  companies: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(data)

  useEffect(() => {
    const initialData = { ...data };
    if (type === 'internships') {
      initialData.responsibilities = arrayToString(data.responsibilities);
      initialData.requiredSkills = arrayToString(data.requiredSkills);
      initialData.benefits = arrayToString(data.benefits);
    }
    if (type === 'events') {
        initialData.address = data.location?.address || '';
        initialData.latitude = data.location?.latitude || '';
        initialData.longitude = data.location?.longitude || '';
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
        delete finalData.address;
        delete finalData.latitude;
        delete finalData.longitude;
    }

    onSave(finalData);
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  }

  const handleTicketChange = (index: number, field: string, value: string) => {
    const newTickets = [...(formData.tickets || [])];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, tickets: newTickets }));
  };

  const addTicket = () => {
    const newTickets = [...(formData.tickets || []), { id: `${Date.now()}`, name: '', price: '', originalPrice: '' }];
    setFormData((prev: any) => ({ ...prev, tickets: newTickets }));
  };

  const removeTicket = (index: number) => {
    const newTickets = [...(formData.tickets || [])];
    newTickets.splice(index, 1);
    setFormData((prev: any) => ({ ...prev, tickets: newTickets }));
  };

  const getFields = () => {
    const fields = {
      events: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'image', label: 'Image URL', type: 'url', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'dateTime', label: 'Date & Time', type: 'datetime-local' },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'venue', label: 'Venue Name', type: 'text' },
        { name: 'address', label: 'Address', type: 'text' },
        { name: 'latitude', label: 'Latitude', type: 'number' },
        { name: 'longitude', label: 'Longitude', type: 'number' },
        { name: 'organizer', label: 'Organizer', type: 'text' },
        { name: 'ageRestriction', label: 'Age Restriction', type: 'text' },
      ],
      companies: [
        { name: 'name', label: 'Company Name', type: 'text', required: true },
        { name: 'logoUrl', label: 'Logo URL', type: 'url', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'headquarters', label: 'Headquarters', type: 'text' },
        { name: 'website', label: 'Website', type: 'url' },
        { name: 'foundedYear', label: 'Founded Year', type: 'number' },
        { name: 'employeeCount', label: 'Employee Count', type: 'text' },
      ],
      internships: [
        { name: 'title', label: 'Internship Title', type: 'text', required: true },
        { name: 'companyId', label: 'Company', type: 'select', options: companies, required: true },
        { name: 'location', label: 'Location', type: 'text' },
        { name: 'mode', label: 'Mode', type: 'text' },
        { name: 'type', label: 'Type', type: 'text' },
        { name: 'durationMonths', label: 'Duration (Months)', type: 'number' },
        { name: 'stipend', label: 'Stipend', type: 'text', placeholder: 'e.g., ₹10,000 /month or Unpaid' },
        { name: 'applyUrl', label: 'Apply URL', type: 'url' },
        { name: 'responsibilities', label: 'Responsibilities (one per line)', type: 'textarea' },
        { name: 'requiredSkills', label: 'Required Skills (one per line)', type: 'textarea' },
        { name: 'benefits', label: 'Benefits (one per line)', type: 'textarea' },
      ],
      users: [
        { name: 'firstName', label: 'First Name', type: 'text' },
        { name: 'lastName', label: 'Last Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
      ]
    }
    return fields[type as keyof typeof fields] || [];
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {getFields().map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-bold text-black mb-1">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea id={field.name} name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} className="w-full p-2 rounded-lg bg-white border-2 border-black focus:ring-2 focus:ring-black" rows={4} required={field.required} />
          ) : field.type === 'select' ? (
             <select id={field.name} name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} required={field.required} className="w-full p-2 rounded-lg bg-white border-2 border-black focus:ring-2 focus:ring-black">
               <option value="" disabled>Select a company</option>
               {field.options && Object.entries(field.options).map(([id, company]: [string, any]) => (<option key={id} value={id}>{company.name}</option>))}
             </select>
          ) : (
            <input id={field.name} name={field.name} type={field.type} value={formData[field.name] || ''} onChange={handleInputChange} className="w-full p-2 rounded-lg bg-white border-2 border-black focus:ring-2 focus:ring-black" required={field.required} placeholder={field.placeholder || ''} step={field.type === 'number' ? 'any' : undefined}/>
          )}
        </div>
      ))}
      
      {type === 'events' && (
        <div>
            <h4 className="text-md font-bold text-black mb-2">Tickets</h4>
            <div className="space-y-4">
                {(formData.tickets || []).map((ticket: any, index: number) => (
                    <div key={index} className="p-3 border-2 border-dashed border-gray-400 rounded-lg space-y-2 relative">
                        <button type="button" onClick={() => removeTicket(index)} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-600"><X size={14} /></button>
                        <input name="name" type="text" value={ticket.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} placeholder="Ticket Name (e.g., VIP)" className="w-full p-2 rounded-lg bg-white border-2 border-black" />
                        <div className="grid grid-cols-2 gap-2">
                           <input name="price" type="text" value={ticket.price} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} placeholder="Price (e.g., ₹499)" className="w-full p-2 rounded-lg bg-white border-2 border-black" />
                           <input name="originalPrice" type="text" value={ticket.originalPrice} onChange={(e) => handleTicketChange(index, 'originalPrice', e.target.value)} placeholder="Original Price" className="w-full p-2 rounded-lg bg-white border-2 border-black" />
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addTicket} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-400 text-gray-600 hover:border-black hover:text-black p-2 rounded-lg transition-colors font-semibold"><Plus size={16} /> Add Ticket Type</button>
            </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px"><Save size={16} /> Save</button>
        <button type="button" onClick={onCancel} className="bg-white hover:bg-gray-100 px-4 py-2 rounded-lg border-2 border-black"><X size={16} /></button>
      </div>
    </form>
  )
}

// --- Main Admin Dashboard Component ---
export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState("")
  const [activeTab, setActiveTab] = useState("events")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [data, setData] = useState<any>({ events: {}, companies: {}, internships: {}, users: {} })
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (document.cookie.includes('admin-auth=true')) setAuthenticated(true)
    const refs = {
        events: ref(database, 'events'),
        companies: ref(database, 'companies'),
        internships: ref(database, 'internships'),
        users: ref(database, 'users'),
    }
    const unsubscribes = Object.entries(refs).map(([key, dbRef]) => 
        onValue(dbRef, (snapshot) => {
            setData((prev: any) => ({ ...prev, [key]: snapshot.val() || {} }))
        })
    );
    return () => unsubscribes.forEach(unsub => unsub());
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === PIN) {
      setAuthenticated(true)
      document.cookie = "admin-auth=true; path=/; max-age=86400"
    } else {
      alert("Invalid PIN");
      setPin("");
    }
  }

  const handleLogout = () => {
    document.cookie = "admin-auth=; path=/; max-age=0"
    setAuthenticated(false)
    router.push('/')
  }

  const handleDelete = async (path: string, id: string) => {
    if (confirm("Are you sure? This cannot be undone.")) {
      await remove(ref(database, `${path}/${id}`))
      if(editingItem?.id === id) setEditingItem(null)
    }
  }

  const handleSave = async (path: string, itemData: any) => {
    const dataToSave = { ...itemData };
    delete dataToSave.id;
    if (editingItem?.id) {
      await set(ref(database, `${path}/${editingItem.id}`), dataToSave);
    } else {
      await push(ref(database, path), dataToSave);
    }
    setEditingItem(null);
  }

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setEditingItem(null);
    setSearchQuery("");
  }

  const filteredData = Object.entries(data[activeTab] || {}).filter(([, item]: [string, any]) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const title = (item.title || item.name || item.fullName || '').toLowerCase();
    const description = (item.description || item.email || item.location || item.category || '').toLowerCase();
    return title.includes(query) || description.includes(query);
  })

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 border-2 border-black shadow-[6px_6px_0px_#000] max-w-sm w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-black">Admin Access</h1>
            <p className="text-gray-600">Enter your PIN to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" maxLength={4} className="w-full p-3 rounded-lg bg-white border-2 border-black text-center text-3xl tracking-[.5em] focus:ring-2 focus:ring-black" autoFocus />
            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px">Enter Dashboard</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <header className="border-b-2 border-black bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black">EXOSPHERE ADMIN</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm bg-white border-2 border-black hover:bg-gray-100 px-4 py-2 rounded-lg font-bold"><LogOut size={16} /> Logout</button>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-black mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Events" value={formatCount(data.events)} icon={Calendar} />
            <StatCard title="Total Companies" value={formatCount(data.companies)} icon={Building2} />
            <StatCard title="Total Internships" value={formatCount(data.internships)} icon={Briefcase} />
            <StatCard title="Total Users" value={formatCount(data.users)} icon={Users} />
          </div>
        </section>
        <div className="flex border-b-2 border-black mb-6">
          {[{ id: "events", label: "Events", icon: Calendar }, { id: "companies", label: "Companies", icon: Building2 }, { id: "internships", label: "Internships", icon: Briefcase }, { id: "users", label: "Users", icon: Users }].map((tab) => (
            <button key={tab.id} onClick={() => handleTabClick(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-4 transition-colors ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}><tab.icon size={16} />{tab.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-auto"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="search" placeholder={`Search ${activeTab}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-64 pl-9 p-2 rounded-lg bg-white border-2 border-black focus:ring-2 focus:ring-black" /></div>
              <button onClick={() => setEditingItem({})} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-px active:translate-x-px"><Plus size={16} /> Add New</button>
            </div>
            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredData.map(([id, item]: [string, any]) => (
                  <div key={id} className="bg-white rounded-lg border-2 border-black overflow-hidden group transition-all hover:shadow-[4px_4px_0px_#000]">
                    {(activeTab === 'events' || activeTab === 'companies') && (
                        <div className="aspect-video bg-gray-100 border-b-2 border-black relative">
                            <img src={item.image || item.logoUrl || PLACEHOLDER_IMAGE} alt={item.title || item.name} className="w-full h-full object-cover"/>
                        </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg pr-4">{item.title || item.name || item.fullName}</h3>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setEditingItem({ ...item, id })} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(activeTab, id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      {activeTab === 'events' && item.category && (<p className="text-xs font-bold text-black uppercase tracking-wider mb-2">{item.category}</p>)}
                      {activeTab === 'companies' && item.headquarters && (<p className="text-sm text-gray-600 mb-2 flex items-center gap-1.5"><MapPin size={14}/> {item.headquarters}</p>)}
                      {activeTab === 'internships' && data.companies[item.companyId] && (<p className="text-sm font-bold text-black mb-2 flex items-center gap-1.5"><Building2 size={14} /> {data.companies[item.companyId]?.name}</p>)}
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description || item.email || item.location || 'No additional details.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-black rounded-lg col-span-1 md:col-span-2">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-bold">No {activeTab} found</h3>
                    <p className="mt-1 text-sm text-gray-500">{searchQuery ? `Your search for "${searchQuery}" did not return any results.` : `Click "Add New" to create the first one.`}</p>
                </div>
            )}
          </div>
          {editingItem && (
            <div className="lg:col-span-1 sticky top-24">
              <div className="bg-white rounded-lg p-6 border-2 border-black shadow-[4px_4px_0px_#000] max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">{editingItem.id ? 'Edit' : 'Create New'} {activeTab.slice(0, -1)}</h3><button onClick={() => setEditingItem(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"><X size={16} /></button></div>
                <EditForm type={activeTab} data={editingItem} companies={data.companies} onSave={(formData) => handleSave(activeTab, formData)} onCancel={() => setEditingItem(null)} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
