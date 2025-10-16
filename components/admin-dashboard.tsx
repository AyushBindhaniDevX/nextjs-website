"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { database } from "@/lib/firebase"
import { ref, onValue, remove, set, push } from "firebase/database"
import { LogOut, Plus, Edit, Trash2, Calendar, Briefcase, Building2, Users, Save, X, Search, BarChart3, MapPin, Zap, Rocket, Shield, Database, Sparkles } from "lucide-react"

const PIN = "5152"
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200.png/e0e0e0/000000?text=No+Image"

// --- Helper Functions & Components ---

const formatCount = (data: any): number => data ? Object.keys(data).length : 0;

function StatCard({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) {
  return (
    <div className="bg-white p-6 rounded-lg neo-border neo-shadow hover:neo-shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-black text-black">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 text-primary neo-shadow-sm neo-border group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"></div>
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
          <label htmlFor={field.name} className="block text-sm font-black text-black mb-2">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea 
              id={field.name} 
              name={field.name} 
              value={formData[field.name] || ''} 
              onChange={handleInputChange} 
              className="w-full p-3 rounded-lg bg-white neo-border focus:ring-2 focus:ring-black font-medium" 
              rows={4} 
              required={field.required} 
            />
          ) : field.type === 'select' ? (
             <select 
               id={field.name} 
               name={field.name} 
               value={formData[field.name] || ''} 
               onChange={handleInputChange} 
               required={field.required} 
               className="w-full p-3 rounded-lg bg-white neo-border focus:ring-2 focus:ring-black font-medium"
             >
               <option value="" disabled>Select a company</option>
               {field.options && Object.entries(field.options).map(([id, company]: [string, any]) => (
                 <option key={id} value={id}>{company.name}</option>
               ))}
             </select>
          ) : (
            <input 
              id={field.name} 
              name={field.name} 
              type={field.type} 
              value={formData[field.name] || ''} 
              onChange={handleInputChange} 
              className="w-full p-3 rounded-lg bg-white neo-border focus:ring-2 focus:ring-black font-medium" 
              required={field.required} 
              placeholder={field.placeholder || ''} 
              step={field.type === 'number' ? 'any' : undefined}
            />
          )}
        </div>
      ))}
      
      {type === 'events' && (
        <div>
            <h4 className="text-md font-black text-black mb-3">Tickets</h4>
            <div className="space-y-4">
                {(formData.tickets || []).map((ticket: any, index: number) => (
                    <div key={index} className="p-4 neo-border border-dashed border-gray-400 rounded-lg space-y-3 relative bg-gray-50">
                        <button type="button" onClick={() => removeTicket(index)} className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-600 neo-shadow-sm rounded-md"><X size={14} /></button>
                        <input name="name" type="text" value={ticket.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} placeholder="Ticket Name (e.g., VIP)" className="w-full p-2 rounded-lg bg-white neo-border font-medium" />
                        <div className="grid grid-cols-2 gap-3">
                           <input name="price" type="text" value={ticket.price} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} placeholder="Price (e.g., ₹499)" className="w-full p-2 rounded-lg bg-white neo-border font-medium" />
                           <input name="originalPrice" type="text" value={ticket.originalPrice} onChange={(e) => handleTicketChange(index, 'originalPrice', e.target.value)} placeholder="Original Price" className="w-full p-2 rounded-lg bg-white neo-border font-medium" />
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addTicket} className="w-full flex items-center justify-center gap-2 neo-border border-dashed border-gray-400 text-gray-600 hover:border-black hover:text-black p-3 rounded-lg transition-colors font-bold">
                  <Plus size={18} /> Add Ticket Type
                </button>
            </div>
        </div>
      )}

      <div className="flex gap-3 pt-6">
        <button type="submit" className="flex-1 flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-black neo-border neo-button text-lg">
          <Save size={18} /> {editingItem?.id ? 'UPDATE' : 'CREATE'}
        </button>
        <button type="button" onClick={onCancel} className="bg-white hover:bg-gray-100 px-6 py-3 rounded-lg neo-border font-bold">
          <X size={18} />
        </button>
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
      alert("❌ Invalid PIN");
      setPin("");
    }
  }

  const handleLogout = () => {
    document.cookie = "admin-auth=; path=/; max-age=0"
    setAuthenticated(false)
    router.push('/')
  }

  const handleDelete = async (path: string, id: string) => {
    if (confirm("⚠️ Are you sure? This action cannot be undone.")) {
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-primary neo-shadow-sm rounded-lg opacity-20 float-animation"></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 bg-secondary neo-shadow-sm rounded-full opacity-30 float-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-10 h-10 bg-accent neo-shadow-sm opacity-25 float-animation" style={{animationDelay: '4s'}}></div>
        
        <div className="bg-card rounded-lg p-8 neo-border neo-shadow-lg max-w-sm w-full relative z-10">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-black text-foreground">SECURE ACCESS</h1>
            </div>
            <p className="text-muted-foreground font-medium">Enter your 4-digit PIN to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input 
                type="password" 
                value={pin} 
                onChange={(e) => setPin(e.target.value)} 
                placeholder="••••" 
                maxLength={4} 
                className="w-full p-4 rounded-lg bg-white neo-border text-center text-3xl tracking-[.5em] font-black focus:ring-2 focus:ring-primary" 
                autoFocus 
              />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-black neo-border neo-button text-lg hover:bg-primary/90 transition-colors">
              LAUNCH DASHBOARD <Rocket className="ml-2 inline h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      {/* Header */}
      <header className="border-b-4 bg-card sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2 text-primary-foreground neo-shadow neo-border">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">EXOSPHERE ADMIN</h1>
              <p className="text-sm text-muted-foreground font-bold">NEO-BRUTALISM EDITION</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-card hover:bg-gray-100 px-4 py-2 rounded-lg font-bold neo-border neo-button">
            <LogOut size={18} /> LOGOUT
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Stats Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-black">DASHBOARD OVERVIEW</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Events" value={formatCount(data.events)} icon={Calendar} />
            <StatCard title="Total Companies" value={formatCount(data.companies)} icon={Building2} />
            <StatCard title="Total Internships" value={formatCount(data.internships)} icon={Briefcase} />
            <StatCard title="Total Users" value={formatCount(data.users)} icon={Users} />
          </div>
        </section>

        {/* Tabs Section */}
        <div className="bg-card rounded-lg p-2 neo-border mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "events", label: "Events", icon: Calendar }, 
              { id: "companies", label: "Companies", icon: Building2 }, 
              { id: "internships", label: "Internships", icon: Briefcase }, 
              { id: "users", label: "Users", icon: Users }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-md font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground neo-shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-6 rounded-lg neo-border">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input 
                  type="search" 
                  placeholder={`SEARCH ${activeTab.toUpperCase()}...`} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-12 p-3 rounded-lg bg-white neo-border focus:ring-2 focus:ring-primary font-medium" 
                />
              </div>
              <button 
                onClick={() => setEditingItem({})} 
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-black neo-border neo-button"
              >
                <Plus size={20} /> CREATE NEW
              </button>
            </div>

            {/* Data Grid */}
            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredData.map(([id, item]: [string, any]) => (
                  <div key={id} className="bg-card rounded-lg neo-border overflow-hidden group transition-all hover:neo-shadow-lg hover:-translate-y-1">
                    {(activeTab === 'events' || activeTab === 'companies') && (
                        <div className="aspect-video bg-gray-100 border-b-4 border-foreground relative">
                            <img 
                              src={item.image || item.logoUrl || PLACEHOLDER_IMAGE} 
                              alt={item.title || item.name} 
                              className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-black text-xl pr-4 line-clamp-2">{item.title || item.name || item.fullName}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <button 
                            onClick={() => setEditingItem({ ...item, id })} 
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md neo-shadow-sm transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(activeTab, id)} 
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md neo-shadow-sm transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {activeTab === 'events' && item.category && (
                        <p className="text-xs font-black text-primary uppercase tracking-wider mb-3">{item.category}</p>
                      )}
                      
                      {activeTab === 'companies' && item.headquarters && (
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2 font-bold">
                          <MapPin size={16}/> {item.headquarters}
                        </p>
                      )}
                      
                      {activeTab === 'internships' && data.companies[item.companyId] && (
                        <p className="text-sm font-black text-secondary mb-3 flex items-center gap-2">
                          <Building2 size={16} /> {data.companies[item.companyId]?.name}
                        </p>
                      )}
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
                        {item.description || item.email || item.location || 'No additional details provided.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-16 neo-border border-dashed rounded-lg bg-card">
                    <Sparkles className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-black mb-2">NO {activeTab.toUpperCase()} FOUND</h3>
                    <p className="text-muted-foreground font-medium max-w-md mx-auto">
                      {searchQuery 
                        ? `Your search for "${searchQuery}" did not return any results.` 
                        : `Ready to create your first ${activeTab.slice(0, -1)}? Click "CREATE NEW" to get started!`
                      }
                    </p>
                </div>
            )}
          </div>

          {/* Edit Form Sidebar */}
          {editingItem && (
            <div className="lg:col-span-1 sticky top-24">
              <div className="bg-card rounded-lg p-6 neo-border neo-shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black">
                    {editingItem.id ? 'EDIT' : 'CREATE'} {activeTab.slice(0, -1).toUpperCase()}
                  </h3>
                  <button 
                    onClick={() => setEditingItem(null)} 
                    className="p-2 text-muted-foreground hover:bg-gray-100 rounded-md neo-shadow-sm"
                  >
                    <X size={18} />
                  </button>
                </div>
                <EditForm 
                  type={activeTab} 
                  data={editingItem} 
                  companies={data.companies} 
                  onSave={(formData) => handleSave(activeTab, formData)} 
                  onCancel={() => setEditingItem(null)} 
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
