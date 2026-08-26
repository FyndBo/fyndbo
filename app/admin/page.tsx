'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// ============================================================
// TYPER
// ============================================================
interface EmailEntry { id: number; email: string; created_at: string }
interface AdminUser { id: number; email: string; created_at: string; added_by: string | null; has_password: boolean; role?: string }
interface Property {
  id: number
  title: string
  description: string | null
  price: number
  area: number | null
  rooms: number | null
  city: string | null
  address: string | null
  postal_code?: string | null
  image_url: string | null
  listing_url: string | null
  latitude: number | null
  longitude: number | null
  created_by?: string
  created_at?: string
  monthly_fee?: number | null
  operating_cost?: number | null
  floor?: string | null
  elevator?: boolean
  balcony?: boolean
  images?: string[]
  property_type?: string | null
  construction_year?: number | null
  plot_area?: number | null
  energy_class?: string | null
  association?: string | null
  is_active?: boolean
}

// ============================================================
// IKONER (professionella SVG)
// ============================================================
const Icon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    dashboard: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    users: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    email: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>,
    newsletter: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    home: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>,
    add: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
    delete: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>,
    edit: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    logout: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    search: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    export: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    key: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="12" r="5"/><path d="M12.5 8.5L21 2"/><path d="M18 5l2 2"/><path d="M15 8l2 2"/></svg>,
    google: <svg className={className} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
    template: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
    send: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    visit: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
    analytics: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12v-2a5 5 0 00-5-5H8a5 5 0 00-5 5v2"/><circle cx="12" cy="16" r="5"/><path d="M12 11v5"/><path d="M9 16h6"/></svg>,
    settings: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    bell: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    message: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    tasks: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    blog: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    feedback: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
    support: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    globe: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    check: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    upload: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    eye: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    refresh: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-1.64-10.56"/></svg>,
  }
  return icons[name] || null
}

// ============================================================
// NYHETSBREVSMALLAR
// ============================================================
const newsletterTemplates = {
  welcome: { name: 'Välkommen', subject: 'Välkommen till FyndBo.se!', content: '<h2>Välkommen till FyndBo.se!</h2><p>Tack för att du anslutit dig till vår VIP-lista!</p>' },
  launch: { name: 'Lansering', subject: 'Lanseringen närmar sig!', content: '<h2>Lanseringen närmar sig!</h2><p>Snart öppnar vi dörrarna till din nästa bostad.</p>' },
  tips: { name: 'Bostadstips', subject: '5 tips för bostadssökande', content: '<h2>5 tips för bostadssökande</h2><p>Gör din bostadsjakt enklare och smartare.</p>' },
  update: { name: 'Uppdatering', subject: 'Ny uppdatering från FyndBo.se', content: '<h2>Vad är nytt?</h2><p>Här är de senaste uppdateringarna från FyndBo.se.</p>' }
}

// ============================================================
// HUVUDKOMPONENT
// ============================================================
export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // ===== NAVIGERING =====
  const [activeMain, setActiveMain] = useState<'dashboard' | 'content' | 'users' | 'communication' | 'system'>('dashboard')
  const [activeSub, setActiveSub] = useState<string>('overview')

  // ===== DATA =====
  const [emails, setEmails] = useState<EmailEntry[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // ===== ADMIN =====
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'maklare'>('admin')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [deletingAdminId, setDeletingAdminId] = useState<number | null>(null)

  // ===== BREVO =====
  const [brevoLists, setBrevoLists] = useState<{ id: number; name: string; totalSubscribers?: number }[]>([])
  const [selectedBrevoList, setSelectedBrevoList] = useState<number | null>(null)
  const [loadingBrevo, setLoadingBrevo] = useState(false)
  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterContent, setNewsletterContent] = useState('')
  const [newsletterTestEmail, setNewsletterTestEmail] = useState('')
  const [sendingNewsletter, setSendingNewsletter] = useState(false)
  const [newsletterResult, setNewsletterResult] = useState<{ success?: boolean; sent?: number; error?: string } | null>(null)

  // ===== BOSTÄDER =====
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [propertyForm, setPropertyForm] = useState({
    title: '', description: '', price: '', area: '', rooms: '',
    address: '', city: '', postal_code: '',
    image_url: '', listing_url: '',
    latitude: '', longitude: '',
    monthly_fee: '', operating_cost: '', floor: '',
    elevator: false, balcony: false,
    images: [] as string[],
    property_type: '', construction_year: '', plot_area: '',
    energy_class: '', association: ''
  })
  const [uploading, setUploading] = useState(false)
  const [deletingPropertyId, setDeletingPropertyId] = useState<number | null>(null)

  // ===== MEDDELANDEN (mock) =====
  const [messages, setMessages] = useState<{ id: number; from: string; subject: string; read: boolean; created_at: string }[]>([
    { id: 1, from: 'kund@exempel.se', subject: 'Fråga om bostad', read: false, created_at: new Date().toISOString() },
  ])

  // ===== RÄKNARE =====
  const unreadMessages = messages.filter(m => !m.read).length
  const isAdmin = (session?.user as any)?.role === 'admin'
  const isMaklare = (session?.user as any)?.role === 'maklare'

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000) }
  const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000) }

  // ===== HÄMTA DATA =====
  useEffect(() => {
    if (status === 'authenticated') {
      Promise.all([fetchEmails(), fetchAdmins(), fetchProperties(), fetchBrevoLists()]).finally(() => setLoading(false))
    }
  }, [status])

  const fetchEmails = async () => { if (!isAdmin) return; try { const res = await fetch('/api/admin/emails'); if (res.ok) { const data = await res.json(); setEmails(data.emails || []) } } catch (err) { console.error(err) } }
  const fetchAdmins = async () => { if (!isAdmin) return; try { const res = await fetch('/api/admin/users'); if (res.ok) { const data = await res.json(); setAdmins(data.admins || []) } } catch (err) { console.error(err) } }
  const fetchProperties = async () => { try { const res = await fetch('/api/properties'); if (res.ok) { const data = await res.json(); setProperties(data.properties || []) } } catch (err) { console.error(err) } }

  const fetchBrevoLists = async () => {
    if (!isAdmin) return
    setLoadingBrevo(true)
    try {
      const res = await fetch('/api/brevo/lists')
      if (res.ok) {
        const data = await res.json()
        setBrevoLists(data.lists || [])
        if (data.lists && data.lists.length > 0) setSelectedBrevoList(data.lists[0].id)
      }
    } catch (err) { console.error(err) } finally { setLoadingBrevo(false) }
  }

  // ===== ADMIN CRUD =====
  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) { showError('Ange en giltig e-postadress'); return }
    setAddingAdmin(true)
    try {
      const body: any = { email: newAdminEmail.trim().toLowerCase(), role: newAdminRole }
      if (newAdminPassword) body.password = newAdminPassword
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kunde inte lägga till')
      showSuccess(`${newAdminEmail} har lagts till som ${newAdminRole}`)
      setNewAdminEmail(''); setNewAdminPassword('')
      await fetchAdmins()
    } catch (err: any) { showError(err.message) } finally { setAddingAdmin(false) }
  }

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm('Är du säker?')) return
    setDeletingAdminId(id)
    try {
      const res = await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!res.ok) throw new Error('Kunde inte ta bort')
      showSuccess('Användare borttagen')
      await fetchAdmins()
    } catch (err: any) { showError(err.message) } finally { setDeletingAdminId(null) }
  }

  // ===== BREVO SEND =====
  const handleSendNewsletterBrevo = async () => {
    if (!newsletterSubject || !newsletterContent) { showError('Fyll i ämne och innehåll'); return }
    if (!selectedBrevoList) { showError('Välj en mottagarlista'); return }
    setSendingNewsletter(true)
    setNewsletterResult(null)
    try {
      const res = await fetch('/api/brevo/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: selectedBrevoList,
          subject: newsletterSubject,
          content: newsletterContent,
          testEmail: newsletterTestEmail || undefined
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewsletterResult({ success: true, sent: data.sent || 0 })
        showSuccess(`Skickat till ${data.sent || 0} mottagare!`)
        setNewsletterSubject(''); setNewsletterContent(''); setNewsletterTestEmail('')
      } else {
        setNewsletterResult({ success: false, error: data.error })
        showError(data.error || 'Kunde inte skicka')
      }
    } catch { showError('Kunde inte skicka nyhetsbrev') } finally { setSendingNewsletter(false) }
  }

  const loadTemplate = (key: keyof typeof newsletterTemplates) => {
    setNewsletterSubject(newsletterTemplates[key].subject)
    setNewsletterContent(newsletterTemplates[key].content)
  }

  // ===== BOSTÄDER CRUD =====
  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData(); formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Uppladdning misslyckades')
      setPropertyForm(prev => ({ ...prev, images: [...prev.images, data.url] }))
      showSuccess('Bild uppladdad!')
    } catch (err: any) { showError(err.message) } finally { setUploading(false) }
  }
  const removeImage = (index: number) => { setPropertyForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) })) }

  const handleGeocode = async () => {
    if (!propertyForm.address || !propertyForm.city) { showError('Fyll i adress och stad först'); return }
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(propertyForm.address)}&city=${encodeURIComponent(propertyForm.city)}&postal_code=${encodeURIComponent(propertyForm.postal_code)}`)
      const data = await res.json()
      if (data.lat && data.lon) {
        setPropertyForm(prev => ({ ...prev, latitude: String(data.lat), longitude: String(data.lon) }))
        showSuccess('Koordinater hittade!')
      } else { showError(data.error || 'Kunde inte hitta koordinater') }
    } catch { showError('Nätverksfel vid geokodning') }
  }

  const handleSaveProperty = async () => {
    if (!propertyForm.title || !propertyForm.price) { showError('Titel och pris krävs'); return }
    const body: any = { ...propertyForm, price: Number(propertyForm.price), area: propertyForm.area ? Number(propertyForm.area) : null, rooms: propertyForm.rooms ? Number(propertyForm.rooms) : null, monthly_fee: propertyForm.monthly_fee ? Number(propertyForm.monthly_fee) : null, operating_cost: propertyForm.operating_cost ? Number(propertyForm.operating_cost) : null, latitude: propertyForm.latitude ? Number(propertyForm.latitude) : null, longitude: propertyForm.longitude ? Number(propertyForm.longitude) : null, created_by: session?.user?.email, images: propertyForm.images, construction_year: propertyForm.construction_year ? Number(propertyForm.construction_year) : null, plot_area: propertyForm.plot_area ? Number(propertyForm.plot_area) : null }
    const method = editingProperty ? 'PUT' : 'POST'
    if (editingProperty) body.id = editingProperty.id
    try {
      const res = await fetch('/api/properties', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kunde inte spara')
      showSuccess(editingProperty ? 'Bostad uppdaterad!' : 'Bostad tillagd!')
      setShowPropertyForm(false); setEditingProperty(null)
      setPropertyForm({ title: '', description: '', price: '', area: '', rooms: '', address: '', city: '', postal_code: '', image_url: '', listing_url: '', latitude: '', longitude: '', monthly_fee: '', operating_cost: '', floor: '', elevator: false, balcony: false, images: [], property_type: '', construction_year: '', plot_area: '', energy_class: '', association: '' })
      await fetchProperties()
    } catch (err: any) { showError(err.message) }
  }

  const handleDeleteProperty = async (id: number) => {
    if (!confirm('Ta bort bostad?')) return
    setDeletingPropertyId(id)
    try {
      const res = await fetch(`/api/properties?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Kunde inte ta bort')
      showSuccess('Bostad borttagen')
      await fetchProperties()
    } catch (err: any) { showError(err.message) } finally { setDeletingPropertyId(null) }
  }

  // ===== EXPORT CSV =====
  const exportCSV = () => {
    const rows = emails.map(e => [e.id, e.email, new Date(e.created_at).toLocaleString('sv-SE')])
    const csv = [['ID', 'E-post', 'Datum'], ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `fyndbo_emails_${new Date().toISOString().split('T')[0]}.csv`; link.click()
  }

  // ===== STATISTIK =====
  const emailsToday = emails.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).length
  const emailsThisWeek = emails.filter(e => { const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); return new Date(e.created_at) >= weekAgo }).length

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>
  }
  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {successMsg && <div className="fixed top-4 right-4 z-50 bg-emerald-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-emerald-400/30"><Icon name="check" className="w-4 h-4" /> {successMsg}</div>}
      {errorMsg && <div className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-red-400/30"><Icon name="delete" className="w-4 h-4" /> {errorMsg}</div>}

      <div className="flex min-h-screen">
        {/* ===== SIDEBAR ===== */}
        <aside className="hidden lg:flex flex-col w-72 bg-slate-800/60 backdrop-blur-xl border-r border-white/5 p-6">
          {/* STOR LOGGA – FyndBo */}
          <Link href="/" className="mb-6 block group">
            <div className="flex flex-col items-center">
              <Image
                src="/Fyndbo-blue-bkg.png"
                alt="FyndBo.se"
                width={160}
                height={100}
                className="h-24 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                priority
              />
              <p className="text-white font-bold text-lg mt-2 tracking-tight group-hover:text-blue-400 transition-colors">FyndBo</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Admin Panel</p>
            </div>
          </Link>

          <nav className="flex-1 space-y-4 overflow-y-auto">
            {/* Dashboard */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 mb-1">Översikt</p>
              <button onClick={() => { setActiveMain('dashboard'); setActiveSub('overview') }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeMain === 'dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name="dashboard" /> Dashboard
              </button>
            </div>

            {/* Innehåll */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 mb-1">Innehåll</p>
              <button onClick={() => { setActiveMain('content'); setActiveSub('properties') }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeMain === 'content' && activeSub === 'properties' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name="home" /> Bostäder <span className="ml-auto bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{properties.length}</span>
              </button>
            </div>

            {/* Användare */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 mb-1">Användare</p>
              <button onClick={() => { setActiveMain('users'); setActiveSub('emails') }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeMain === 'users' && activeSub === 'emails' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name="email" /> Anmälningar <span className="ml-auto bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{emails.length}</span>
              </button>
              <button onClick={() => { setActiveMain('users'); setActiveSub('admins') }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeMain === 'users' && activeSub === 'admins' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name="users" /> Admin-användare <span className="ml-auto bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{admins.length}</span>
              </button>
              <button onClick={() => { setActiveMain('users'); setActiveSub('messages') }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeMain === 'users' && activeSub === 'messages' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name="message" /> Meddelanden {unreadMessages > 0 && <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full animate-pulse">{unreadMessages}</span>}
              </button>
            </div>

            {/* Kommunikation */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 mb-1">Kommunikation</p>
              <button onClick={() => { setActiveMain('communication'); setActiveSub('newsletter') }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeMain === 'communication' && activeSub === 'newsletter' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name="send" /> Nyhetsbrev
              </button>
            </div>

            {/* System */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 mb-1">System</p>
              <button onClick={() => { setActiveMain('system'); setActiveSub('analytics') }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeMain === 'system' && activeSub === 'analytics' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name="analytics" /> Analys
              </button>
              <button onClick={() => { setActiveMain('system'); setActiveSub('settings') }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeMain === 'system' && activeSub === 'settings' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name="settings" /> Inställningar
              </button>
              <button onClick={() => { setActiveMain('system'); setActiveSub('activity') }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeMain === 'system' && activeSub === 'activity' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Icon name="bell" /> Aktivitet
              </button>
            </div>
          </nav>

          <div className="border-t border-white/5 pt-4 mt-4 space-y-1">
            <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"><Icon name="visit" /> Besök sajten</a>
            <button onClick={() => router.push('/api/auth/signout')} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition w-full"><Icon name="logout" /> Logga ut</button>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-800/30 backdrop-blur-sm border-b border-white/5">
            <h1 className="text-xl font-semibold text-white">
              {activeMain === 'dashboard' && 'Översikt'}
              {activeMain === 'content' && activeSub === 'properties' && 'Bostäder'}
              {activeMain === 'users' && activeSub === 'emails' && 'Intresseanmälningar'}
              {activeMain === 'users' && activeSub === 'admins' && 'Admin-användare'}
              {activeMain === 'users' && activeSub === 'messages' && 'Meddelanden'}
              {activeMain === 'communication' && activeSub === 'newsletter' && 'Nyhetsbrev'}
              {activeMain === 'system' && activeSub === 'analytics' && 'Analys'}
              {activeMain === 'system' && activeSub === 'settings' && 'Inställningar'}
              {activeMain === 'system' && activeSub === 'activity' && 'Aktivitetslogg'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">{session.user?.email}</span>
              <button onClick={() => router.push('/api/auth/signout')} className="text-slate-400 hover:text-white text-sm transition">Logga ut</button>
            </div>
          </header>

          {/* Mobil */}
          <div className="lg:hidden bg-slate-800/50 border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/Fyndbo-blue-bkg.png" alt="FyndBo" width={40} height={30} className="h-8 w-auto" />
              <h2 className="text-lg font-bold text-white">FyndBo</h2>
            </div>
            <button onClick={() => router.push('/api/auth/signout')} className="text-red-400 p-2"><Icon name="logout" /></button>
          </div>

          {/* Rubriknavigation */}
          <div className="border-b border-white/5 px-4 py-2 flex gap-2 overflow-x-auto bg-slate-800/20">
            <button onClick={() => { setActiveMain('dashboard'); setActiveSub('overview') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeMain === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Översikt</button>
            <button onClick={() => { setActiveMain('content'); setActiveSub('properties') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeMain === 'content' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Innehåll</button>
            <button onClick={() => { setActiveMain('users'); setActiveSub('emails') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeMain === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Användare</button>
            <button onClick={() => { setActiveMain('communication'); setActiveSub('newsletter') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeMain === 'communication' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Kommunikation</button>
            <button onClick={() => { setActiveMain('system'); setActiveSub('analytics') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeMain === 'system' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>System</button>
          </div>

          {/* Subnavigation */}
          {activeMain !== 'dashboard' && (
            <div className="border-b border-white/5 px-4 py-2 flex gap-2 overflow-x-auto bg-slate-800/10">
              {activeMain === 'content' && (
                <>
                  <button onClick={() => setActiveSub('properties')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSub === 'properties' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon name="home" className="w-4 h-4 inline mr-1" /> Bostäder</button>
                </>
              )}
              {activeMain === 'users' && (
                <>
                  <button onClick={() => setActiveSub('emails')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSub === 'emails' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon name="email" className="w-4 h-4 inline mr-1" /> Anmälningar</button>
                  <button onClick={() => setActiveSub('admins')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSub === 'admins' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon name="users" className="w-4 h-4 inline mr-1" /> Admins</button>
                  <button onClick={() => setActiveSub('messages')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSub === 'messages' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon name="message" className="w-4 h-4 inline mr-1" /> Meddelanden</button>
                </>
              )}
              {activeMain === 'communication' && (
                <>
                  <button onClick={() => setActiveSub('newsletter')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSub === 'newsletter' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon name="send" className="w-4 h-4 inline mr-1" /> Nyhetsbrev</button>
                </>
              )}
              {activeMain === 'system' && (
                <>
                  <button onClick={() => setActiveSub('analytics')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSub === 'analytics' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon name="analytics" className="w-4 h-4 inline mr-1" /> Analys</button>
                  <button onClick={() => setActiveSub('settings')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSub === 'settings' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon name="settings" className="w-4 h-4 inline mr-1" /> Inställningar</button>
                  <button onClick={() => setActiveSub('activity')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeSub === 'activity' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon name="bell" className="w-4 h-4 inline mr-1" /> Aktivitet</button>
                </>
              )}
            </div>
          )}

          {/* ===== INNEHÅLL ===== */}
          <main className="flex-1 p-4 lg:p-8 overflow-auto">

            {/* DASHBOARD */}
            {activeMain === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/20 transition"><span className="text-slate-400 text-xs uppercase">Totalt</span><p className="text-3xl font-bold text-white mt-2">{emails.length}</p><p className="text-slate-500 text-xs">anmälningar</p></div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/20 transition"><span className="text-slate-400 text-xs uppercase">Idag</span><p className="text-3xl font-bold text-white mt-2">{emailsToday}</p><p className="text-slate-500 text-xs">nya idag</p></div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/20 transition"><span className="text-slate-400 text-xs uppercase">Admins</span><p className="text-3xl font-bold text-white mt-2">{admins.length}</p><p className="text-slate-500 text-xs">användare</p></div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/20 transition"><span className="text-slate-400 text-xs uppercase">Vecka</span><p className="text-3xl font-bold text-white mt-2">{emailsThisWeek}</p><p className="text-slate-500 text-xs">denna vecka</p></div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <p className="text-slate-400 text-sm">Välkommen till adminpanelen! Här kan du hantera allt.</p>
                  <p className="text-slate-500 text-xs mt-2">Inloggad som: {session.user?.email}</p>
                </div>
              </div>
            )}

            {/* BOSTÄDER */}
            {activeMain === 'content' && activeSub === 'properties' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div><h2 className="text-xl font-bold text-white">{isMaklare ? 'Mina bostäder' : 'Bostäder'}</h2><p className="text-slate-400 text-sm">{properties.length} annonser</p></div>
                  <button onClick={() => { setEditingProperty(null); setPropertyForm({ title: '', description: '', price: '', area: '', rooms: '', address: '', city: '', postal_code: '', image_url: '', listing_url: '', latitude: '', longitude: '', monthly_fee: '', operating_cost: '', floor: '', elevator: false, balcony: false, images: [], property_type: '', construction_year: '', plot_area: '', energy_class: '', association: '' }); setShowPropertyForm(true) }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"><Icon name="add" className="w-4 h-4" /> Lägg till</button>
                </div>

                {showPropertyForm && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{editingProperty ? 'Redigera bostad' : 'Ny bostad'}</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><label className="block text-sm text-slate-400 mb-1">Titel *</label><input value={propertyForm.title} onChange={e => setPropertyForm({ ...propertyForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Pris (kr) *</label><input type="number" value={propertyForm.price} onChange={e => setPropertyForm({ ...propertyForm, price: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Area (m²)</label><input type="number" value={propertyForm.area} onChange={e => setPropertyForm({ ...propertyForm, area: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Rum</label><input type="number" step="any" value={propertyForm.rooms} onChange={e => setPropertyForm({ ...propertyForm, rooms: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Adress</label><input value={propertyForm.address} onChange={e => setPropertyForm({ ...propertyForm, address: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Postnr</label><input value={propertyForm.postal_code} onChange={e => setPropertyForm({ ...propertyForm, postal_code: e.target.value })} placeholder="12345" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Stad</label><input value={propertyForm.city} onChange={e => setPropertyForm({ ...propertyForm, city: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Månadsavgift (kr)</label><input type="number" value={propertyForm.monthly_fee} onChange={e => setPropertyForm({ ...propertyForm, monthly_fee: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Våning</label><input value={propertyForm.floor} onChange={e => setPropertyForm({ ...propertyForm, floor: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Bostadstyp</label><select value={propertyForm.property_type} onChange={e => setPropertyForm({ ...propertyForm, property_type: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"><option value="">Välj...</option><option value="villa">Villa</option><option value="lägenhet">Lägenhet</option><option value="radhus">Radhus</option><option value="fritidshus">Fritidshus</option><option value="tomt">Tomt</option></select></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Energiklass</label><select value={propertyForm.energy_class} onChange={e => setPropertyForm({ ...propertyForm, energy_class: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"><option value="">Välj...</option>{['A','B','C','D','E','F','G'].map(cls => <option key={cls} value={cls}>{cls}</option>)}</select></div>
                      <div className="flex items-center gap-4 col-span-2"><label className="flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={propertyForm.elevator} onChange={e => setPropertyForm({ ...propertyForm, elevator: e.target.checked })} /> Hiss</label><label className="flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={propertyForm.balcony} onChange={e => setPropertyForm({ ...propertyForm, balcony: e.target.checked })} /> Balkong</label></div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm text-slate-400 mb-1">Bilder</label>
                      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500/50 transition group" onDragOver={(e) => e.preventDefault()} onDrop={async (e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) await uploadFile(file) }}>
                        <Icon name="upload" className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition" />
                        <p className="text-sm text-slate-400 group-hover:text-blue-400 transition">{uploading ? 'Laddar upp...' : 'Dra och släpp eller klicka'}</p>
                        <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) await uploadFile(file) }} />
                      </label>
                      {propertyForm.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {propertyForm.images.map((url, idx) => (
                            <div key={idx} className="relative group"><img src={url} alt={`bild ${idx+1}`} className="h-16 w-16 object-cover rounded-lg border border-white/10" /><button onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 shadow-lg">×</button></div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <button onClick={handleGeocode} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20"><Icon name="search" className="w-4 h-4" /> Hitta koordinater</button>
                      {propertyForm.latitude && propertyForm.longitude && <span className="text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1"><Icon name="check" className="w-3 h-3" /> Hittad</span>}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleSaveProperty} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20">Spara</button>
                      <button onClick={() => { setShowPropertyForm(false); setEditingProperty(null) }} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl">Avbryt</button>
                    </div>
                  </div>
                )}

                {properties.length === 0 ? (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center"><p className="text-slate-400">Inga bostäder tillagda</p></div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/5"><tr><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Titel</th><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Pris</th><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase hidden sm:table-cell">Stad</th><th className="text-right py-3 px-6 text-slate-400 text-xs uppercase">Åtgärd</th></tr></thead>
                      <tbody>{properties.map((p) => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-6 text-white text-sm">{p.title}</td>
                          <td className="py-3 px-6 text-blue-400 text-sm">{new Intl.NumberFormat('sv-SE').format(p.price)} kr</td>
                          <td className="py-3 px-6 text-slate-400 text-sm hidden sm:table-cell">{p.city}</td>
                          <td className="py-3 px-6 text-right">
                            <button onClick={() => {
                              setEditingProperty(p)
                              setPropertyForm({
                                title: p.title, description: p.description || '', price: String(p.price),
                                area: p.area ? String(p.area) : '', rooms: p.rooms ? String(p.rooms) : '',
                                address: p.address || '', city: p.city || '', postal_code: p.postal_code || '',
                                image_url: p.image_url || '', listing_url: p.listing_url || '',
                                latitude: p.latitude ? String(p.latitude) : '', longitude: p.longitude ? String(p.longitude) : '',
                                monthly_fee: p.monthly_fee ? String(p.monthly_fee) : '',
                                operating_cost: p.operating_cost ? String(p.operating_cost) : '',
                                floor: p.floor || '', elevator: p.elevator || false, balcony: p.balcony || false,
                                images: p.images || [],
                                property_type: p.property_type || '', construction_year: p.construction_year ? String(p.construction_year) : '',
                                plot_area: p.plot_area ? String(p.plot_area) : '', energy_class: p.energy_class || '',
                                association: p.association || ''
                              })
                              setShowPropertyForm(true)
                            }} className="text-amber-400 hover:text-amber-300 p-1"><Icon name="edit" className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteProperty(p.id)} disabled={deletingPropertyId === p.id} className="text-red-400 hover:text-red-300 disabled:opacity-30 p-1"><Icon name="delete" className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ANMÄLNINGAR */}
            {activeMain === 'users' && activeSub === 'emails' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div><h2 className="text-xl font-bold text-white">Intresseanmälningar</h2><p className="text-slate-400 text-sm">{emails.length} registrerade</p></div>
                  <button onClick={exportCSV} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center gap-2 border border-emerald-500/20"><Icon name="export" className="w-4 h-4" /> Exportera CSV</button>
                </div>
                {emails.length === 0 ? (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center"><p className="text-slate-400">Inga anmälningar ännu</p></div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/5"><tr><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">E-post</th><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase hidden sm:table-cell">Datum</th><th className="text-right py-3 px-6 text-slate-400 text-xs uppercase">Åtgärd</th></tr></thead>
                      <tbody>{emails.map((e) => (
                        <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-6 text-white text-sm">{e.email}</td>
                          <td className="py-3 px-6 text-slate-400 text-sm hidden sm:table-cell">{new Date(e.created_at).toLocaleString('sv-SE')}</td>
                          <td className="py-3 px-6 text-right">
                            <button onClick={async () => {
                              if (!confirm('Radera denna e-post?')) return
                              const res = await fetch('/api/admin/emails', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: e.id }) })
                              if (res.ok) { setEmails(emails.filter(em => em.id !== e.id)); showSuccess('E-post raderad') } else showError('Kunde inte radera')
                            }} className="text-red-400 hover:text-red-300 p-1"><Icon name="delete" className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN-ANVÄNDARE */}
            {activeMain === 'users' && activeSub === 'admins' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Admin-användare</h2>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2"><Icon name="add" /> Lägg till</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="E-post" className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} placeholder="Lösenord (valfritt)" className="sm:w-48 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={newAdminRole} onChange={e => setNewAdminRole(e.target.value as 'admin' | 'maklare')} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"><option value="admin">Admin</option><option value="maklare">Mäklare</option></select>
                    <button onClick={handleAddAdmin} disabled={addingAdmin} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-white flex items-center gap-2 shadow-lg shadow-blue-500/20"><Icon name="add" className="w-4 h-4" /> {addingAdmin ? 'Lägger till...' : 'Lägg till'}</button>
                  </div>
                  <p className="text-slate-500 text-xs mt-2 flex items-center gap-1"><Icon name="key" className="w-3 h-3" /> Lösenord valfritt – utan lösenord loggar användaren in med Google.</p>
                </div>
                {admins.length === 0 ? (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center"><p className="text-slate-400">Inga admin-användare</p></div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/5"><tr><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">E-post</th><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Roll</th><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Inloggning</th><th className="text-right py-3 px-6 text-slate-400 text-xs uppercase">Åtgärd</th></tr></thead>
                      <tbody>{admins.map((a) => (
                        <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-6 text-white text-sm">{a.email}</td>
                          <td className="py-3 px-6"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.role === 'maklare' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{a.role || 'admin'}</span></td>
                          <td className="py-3 px-6">{a.has_password ? <span className="text-amber-400 text-xs bg-amber-400/10 px-2 py-0.5 rounded-full"><Icon name="key" className="w-3 h-3 inline" /> Lösenord</span> : <span className="text-blue-400 text-xs bg-blue-400/10 px-2 py-0.5 rounded-full"><Icon name="google" className="w-3 h-3 inline" /> Google</span>}</td>
                          <td className="py-3 px-6 text-right"><button onClick={() => handleDeleteAdmin(a.id)} disabled={deletingAdminId === a.id} className="text-red-400 hover:text-red-300 disabled:opacity-30 p-1"><Icon name="delete" className="w-4 h-4" /></button></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MEDDELANDEN */}
            {activeMain === 'users' && activeSub === 'messages' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Meddelanden</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center"><span className="text-slate-400 text-xs">Totalt</span><p className="text-2xl font-bold text-white">{messages.length}</p></div>
                  <div className="bg-white/5 rounded-xl p-4 text-center"><span className="text-slate-400 text-xs">Olästa</span><p className="text-2xl font-bold text-white">{unreadMessages}</p></div>
                  <div className="bg-white/5 rounded-xl p-4 text-center"><span className="text-slate-400 text-xs">Lästa</span><p className="text-2xl font-bold text-white">{messages.length - unreadMessages}</p></div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/5"><tr><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Status</th><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Från</th><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Ämne</th><th className="text-right py-3 px-6 text-slate-400 text-xs uppercase">Åtgärd</th></tr></thead>
                    <tbody>{messages.map((msg) => (
                      <tr key={msg.id} className={`border-b border-white/5 hover:bg-white/5 ${!msg.read ? 'bg-blue-500/5' : ''}`}>
                        <td className="py-3 px-6">{!msg.read ? <span className="inline-flex items-center gap-1 text-blue-400 text-xs bg-blue-400/10 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>Oläst</span> : <span className="text-slate-500 text-xs">Läst</span>}</td>
                        <td className="py-3 px-6 text-white text-sm">{msg.from}</td>
                        <td className="py-3 px-6 text-slate-300 text-sm">{msg.subject}</td>
                        <td className="py-3 px-6 text-right">
                          <button onClick={() => { setMessages(messages.map(m => m.id === msg.id ? { ...m, read: true } : m)); showSuccess('Markerades som läst') }} className="text-blue-400 hover:text-blue-300 p-1"><Icon name="eye" className="w-4 h-4" /></button>
                          <button onClick={() => { setMessages(messages.filter(m => m.id !== msg.id)); showSuccess('Meddelande raderat') }} className="text-red-400 hover:text-red-300 p-1"><Icon name="delete" className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {/* NYHETSBREV (BREVO) */}
            {activeMain === 'communication' && activeSub === 'newsletter' && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div><h2 className="text-xl font-bold text-white">Skicka nyhetsbrev via Brevo</h2><p className="text-slate-400 text-sm">{loadingBrevo ? 'Laddar listor...' : `${brevoLists.length} anslutna listor`}</p></div>
                  <button onClick={fetchBrevoLists} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-400 hover:text-white transition flex items-center gap-1"><Icon name="refresh" className="w-4 h-4" /> Uppdatera</button>
                </div>

                {loadingBrevo ? (
                  <div className="flex items-center justify-center py-8"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div><span className="ml-3 text-slate-400">Laddar listor...</span></div>
                ) : brevoLists.length === 0 ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 text-sm">
                    <p className="font-medium">Inga Brevo-listor hittades</p>
                    <p className="text-xs mt-1 text-slate-400">Kontrollera din BREVO_API_KEY i .env.local och att du har skapat listor i Brevo.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="text-slate-400 text-sm block mb-2">📋 Välj mottagarlista</label>
                      <select value={selectedBrevoList || ''} onChange={e => setSelectedBrevoList(Number(e.target.value))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {brevoLists.map(list => (
                          <option key={list.id} value={list.id}>{list.name} ({list.totalSubscribers || 0} prenumeranter)</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="text-slate-400 text-sm block mb-2">📋 Mallar</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(newsletterTemplates).map(([key, tpl]) => (
                          <button key={key} onClick={() => loadTemplate(key as keyof typeof newsletterTemplates)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white border border-white/10 transition">{tpl.name}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-400 text-sm block mb-1">Ämne *</label>
                        <input type="text" value={newsletterSubject} onChange={e => setNewsletterSubject(e.target.value)} placeholder="Ange ämne..." className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-1">Innehåll (HTML) *</label>
                        <textarea rows={6} value={newsletterContent} onChange={e => setNewsletterContent(e.target.value)} placeholder="<h1>Välkommen!</h1><p>Här är våra senaste bostäder...</p>" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-1">Test-e-post <span className="text-slate-500 text-xs">(valfritt)</span></label>
                        <input type="email" value={newsletterTestEmail} onChange={e => setNewsletterTestEmail(e.target.value)} placeholder="test@exempel.se" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>

                      <div className="flex gap-3">
                        <button onClick={handleSendNewsletterBrevo} disabled={sendingNewsletter || !selectedBrevoList} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition">
                          <Icon name="send" className="w-4 h-4" /> {sendingNewsletter ? 'Skickar...' : newsletterTestEmail ? 'Skicka test' : 'Skicka till lista'}
                        </button>
                        {newsletterTestEmail && (
                          <button onClick={() => setNewsletterTestEmail('')} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl font-medium transition">Avbryt test</button>
                        )}
                      </div>

                      {newsletterResult && (
                        <div className={`p-4 rounded-xl ${newsletterResult.success ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
                          {newsletterResult.success ? `✅ Skickat till ${newsletterResult.sent} mottagare!` : `❌ ${newsletterResult.error}`}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ANALYS */}
            {activeMain === 'system' && activeSub === 'analytics' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Analys</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5"><span className="text-slate-400 text-xs uppercase">Visningar</span><p className="text-2xl font-bold text-white mt-2">{(properties.length * 47 + 1234).toLocaleString()}</p><p className="text-slate-500 text-xs">denna månad</p><div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '76%' }}></div></div></div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5"><span className="text-slate-400 text-xs uppercase">Klickfrekvens</span><p className="text-2xl font-bold text-white mt-2">3.2%</p><p className="text-slate-500 text-xs">genomsnitt</p><div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: '32%' }}></div></div></div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5"><span className="text-slate-400 text-xs uppercase">Aktiva bostäder</span><p className="text-2xl font-bold text-white mt-2">{properties.filter(p => p.is_active !== false).length}</p><p className="text-slate-500 text-xs">just nu</p><div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${properties.length > 0 ? (properties.filter(p => p.is_active !== false).length / properties.length) * 100 : 0}%` }}></div></div></div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h3 className="text-white font-semibold mb-3">Prestandaöversikt</h3>
                  <div className="space-y-3">
                    <div><div className="flex justify-between text-sm"><span className="text-slate-400">Prenumeranter</span><span className="text-white">{emails.length}</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div></div></div>
                    <div><div className="flex justify-between text-sm"><span className="text-slate-400">Bostäder</span><span className="text-white">{properties.length}</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, properties.length * 10)}%` }}></div></div></div>
                    <div><div className="flex justify-between text-sm"><span className="text-slate-400">Användare</span><span className="text-white">{admins.length}</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, admins.length * 20)}%` }}></div></div></div>
                  </div>
                </div>
              </div>
            )}

            {/* INSTÄLLNINGAR */}
            {activeMain === 'system' && activeSub === 'settings' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Inställningar</h2>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Företagsinformation</h3>
                  <div className="space-y-3">
                    <div><label className="block text-sm text-slate-400 mb-1">Företagsnamn</label><input type="text" value="FyndBo.se" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm text-slate-400 mb-1">E-post</label><input type="email" value="info@fyndbo.se" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm text-slate-400 mb-1">Telefon</label><input type="text" value="+46 70 000 00 00" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm text-slate-400 mb-1">Webbplats</label><input type="text" value="https://fyndbo.se" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Inställningar</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer"><span className="text-white text-sm">Mörkt läge</span><div className="relative w-12 h-6"><input type="checkbox" checked className="sr-only peer" /><div className="w-12 h-6 bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div></div></label>
                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer"><span className="text-white text-sm">Push-notiser</span><div className="relative w-12 h-6"><input type="checkbox" checked className="sr-only peer" /><div className="w-12 h-6 bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div></div></label>
                    <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer"><span className="text-white text-sm">E-postnotiser</span><div className="relative w-12 h-6"><input type="checkbox" checked className="sr-only peer" /><div className="w-12 h-6 bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div></div></label>
                  </div>
                </div>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20">Spara inställningar</button>
              </div>
            )}

            {/* AKTIVITET */}
            {activeMain === 'system' && activeSub === 'activity' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Aktivitetslogg</h2>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/5"><tr><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Åtgärd</th><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Användare</th><th className="text-left py-3 px-6 text-slate-400 text-xs uppercase">Tid</th></tr></thead>
                    <tbody>
                      <tr className="border-b border-white/5 hover:bg-white/5"><td className="py-3 px-6 text-white text-sm">Användare loggade in</td><td className="py-3 px-6 text-slate-400 text-sm">{session.user?.email}</td><td className="py-3 px-6 text-slate-400 text-sm">{new Date().toLocaleString('sv-SE')}</td></tr>
                      <tr className="border-b border-white/5 hover:bg-white/5"><td className="py-3 px-6 text-white text-sm">Dashboard öppnad</td><td className="py-3 px-6 text-slate-400 text-sm">{session.user?.email}</td><td className="py-3 px-6 text-slate-400 text-sm">{new Date().toLocaleString('sv-SE')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}