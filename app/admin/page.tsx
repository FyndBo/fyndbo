'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

// ============================================================
// Typer
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
}

// ============================================================
// Ikoner (egna SVG, inga emojis)
// ============================================================
const Icons = {
  dashboard: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="9" height="9" rx="1.5"/><rect x="13" y="2" width="9" height="9" rx="1.5"/>
      <rect x="2" y="13" width="9" height="9" rx="1.5"/><rect x="13" y="13" width="9" height="9" rx="1.5"/>
    </svg>
  ),
  users: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round"/>
      <circle cx="17" cy="6" r="2"/><path d="M15 14c2.5 0 4.5 1.5 5.5 3.5" strokeLinecap="round"/>
    </svg>
  ),
  email: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 7 10-7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  newsletter: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12l-9 6-9-6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 6v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
      <path d="M3 6l9 6 9-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  home: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  add: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round"/>
    </svg>
  ),
  delete: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/><line x1="8" y1="8" x2="16" y2="16" strokeLinecap="round"/>
      <line x1="16" y1="8" x2="8" y2="16" strokeLinecap="round"/>
    </svg>
  ),
  edit: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  logout: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round"/>
    </svg>
  ),
  search: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round"/>
    </svg>
  ),
  export: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round"/>
    </svg>
  ),
  key: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="12" r="5"/><path d="M12.5 8.5L21 2" strokeLinecap="round"/>
      <path d="M18 5l2 2" strokeLinecap="round"/><path d="M15 8l2 2" strokeLinecap="round"/>
    </svg>
  ),
  google: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  template: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="16" rx="2"/><path d="M2 8h20"/>
      <path d="M7 5v3M10 5v3" strokeLinecap="round"/>
    </svg>
  ),
  send: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  visitSite: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round"/>
    </svg>
  ),
}

// ============================================================
// Nyhetsbrevsmallar (premium)
// ============================================================
const newsletterTemplates = {
  welcome: {
    name: 'Välkommen',
    subject: 'Välkommen till FyndBo.se!',
    content: `<div style="text-align: center; margin-bottom: 24px;"><h2 style="color: #1e293b; font-size: 28px; margin: 0 0 8px 0;">Välkommen till FyndBo.se!</h2><p style="color: #64748b; font-size: 16px; margin: 0;">Sveriges modernaste bostadsplattform</p></div><p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Tack för att du har anslutit dig till vår VIP-lista! Du är nu bland de första som får ta del av våra lanseringar, exklusiva erbjudanden och marknadsinsikter.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;"><tr><td style="background: #f1f5f9; border-radius: 12px; padding: 20px;"><p style="font-weight: bold; color: #1e293b; margin: 0 0 12px 0;">✨ Som VIP-medlem får du:</p><ul style="margin: 0; padding-left: 20px; color: #333; font-size: 16px;"><li style="margin-bottom: 8px;">Tidig tillgång till nya bostadsannonser</li><li style="margin-bottom: 8px;">Exklusiva marknadsrapporter</li><li style="margin-bottom: 8px;">Personliga rekommendationer</li><li style="margin-bottom: 8px;">Inbjudningar till visningar och event</li></ul></td></tr></table><p style="font-size: 14px; color: #64748b; margin: 0; text-align: center;">Vi hörs snart!<br>— Teamet bakom FyndBo.se</p>`
  },
  launch: {
    name: 'Lansering',
    subject: 'Lanseringen närmar sig!',
    content: `<div style="text-align: center; margin-bottom: 24px;"><h2 style="color: #1e293b; font-size: 28px; margin: 0 0 8px 0;">Lanseringen närmar sig!</h2><p style="color: #64748b; font-size: 16px; margin: 0;">Snart öppnar vi dörrarna till din nästa bostad</p></div><p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Vi arbetar intensivt med de sista detaljerna för att ge dig en modern och smidig upplevelse. Här är några av funktionerna du kan se fram emot:</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;"><tr><td style="background: #f1f5f9; border-radius: 12px; padding: 20px;"><ul style="margin: 0; padding-left: 20px; color: #333; font-size: 16px;"><li style="margin-bottom: 8px;">🔍 Avancerad sökning med filter</li><li style="margin-bottom: 8px;">🗺️ Interaktiv karta över hela Sverige</li><li style="margin-bottom: 8px;">📊 Prisutveckling och statistik</li><li style="margin-bottom: 8px;">🔔 Bevakningar direkt i din inkorg</li></ul></td></tr></table><p style="font-size: 14px; color: #64748b; margin: 0; text-align: center;">Vi ses vid lansering!<br>— Teamet bakom FyndBo.se</p>`
  },
  tips: {
    name: 'Bostadstips',
    subject: '5 tips för bostadssökande',
    content: `<div style="text-align: center; margin-bottom: 24px;"><h2 style="color: #1e293b; font-size: 28px; margin: 0 0 8px 0;">5 tips för bostadssökande</h2><p style="color: #64748b; font-size: 16px; margin: 0;">Gör din bostadsjakt enklare och smartare</p></div><p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Att hitta rätt bostad kan vara en utmaning. Här är våra bästa tips för att lyckas:</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;"><tr><td style="background: #f1f5f9; border-radius: 12px; padding: 20px;"><ol style="margin: 0; padding-left: 20px; color: #333; font-size: 16px;"><li style="margin-bottom: 12px;"><strong>Sätt en realistisk budget</strong><br><span style="color: #64748b;">Räkna in lagfart, pantbrev och eventuella renoveringar.</span></li><li style="margin-bottom: 12px;"><strong>Använd vår sökfunktion</strong><br><span style="color: #64748b;">Filtrera på pris, område, storlek och mycket mer.</span></li><li style="margin-bottom: 12px;"><strong>Gå på visningar</strong><br><span style="color: #64748b;">Inget slår känslan av att uppleva bostaden på plats.</span></li><li style="margin-bottom: 12px;"><strong>Ställ frågor till mäklaren</strong><br><span style="color: #64748b;">Var nyfiken på föreningens ekonomi och framtidsplaner.</span></li><li style="margin-bottom: 0;"><strong>Var snabb men noggrann</strong><br><span style="color: #64748b;">Drömhemmet går snabbt – men glöm inte att läsa på ordentligt.</span></li></ol></td></tr></table><p style="font-size: 14px; color: #64748b; margin: 0; text-align: center;">Lycka till med bostadsjakten!<br>— Teamet bakom FyndBo.se</p>`
  },
  update: {
    name: 'Uppdatering',
    subject: 'Ny uppdatering från FyndBo.se',
    content: `<div style="text-align: center; margin-bottom: 24px;"><h2 style="color: #1e293b; font-size: 28px; margin: 0 0 8px 0;">Vad är nytt?</h2><p style="color: #64748b; font-size: 16px; margin: 0;">Här är de senaste uppdateringarna från FyndBo.se</p></div><p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Vi fortsätter att förbättra plattformen för att göra din bostadsjakt ännu smidigare. Här är några av de senaste nyheterna:</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;"><tr><td style="background: #f1f5f9; border-radius: 12px; padding: 20px;"><ul style="margin: 0; padding-left: 20px; color: #333; font-size: 16px;"><li style="margin-bottom: 8px;">✅ Bostadssökning med avancerade filter</li><li style="margin-bottom: 8px;">✅ Adminpanel för mäklare</li><li style="margin-bottom: 8px;">✅ Kartintegration</li><li style="margin-bottom: 8px;">✅ Förbättrad design för bättre användarupplevelse</li></ul></td></tr></table><p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Din feedback är viktig för oss! Svara gärna på detta mail med dina tankar och önskemål.</p><p style="font-size: 14px; color: #64748b; margin: 0; text-align: center;">Tack för att du är med på vår resa!<br>— Teamet bakom FyndBo.se</p>`
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'overview' | 'emails' | 'admins' | 'newsletter' | 'properties'>('overview')
  const [emails, setEmails] = useState<EmailEntry[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [adminError, setAdminError] = useState('')

  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'maklare'>('admin')
  const [addingAdmin, setAddingAdmin] = useState(false)

  const [editingPasswordId, setEditingPasswordId] = useState<number | null>(null)
  const [editPassword, setEditPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [editingRoleId, setEditingRoleId] = useState<number | null>(null)
  const [editRole, setEditRole] = useState<string>('')
  const [savingRole, setSavingRole] = useState(false)

  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterContent, setNewsletterContent] = useState('')
  const [newsletterTestEmail, setNewsletterTestEmail] = useState('')
  const [sendingNewsletter, setSendingNewsletter] = useState(false)
  const [newsletterResult, setNewsletterResult] = useState<{ success?: boolean; sent?: number; error?: string } | null>(null)

  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [propertyForm, setPropertyForm] = useState({
    title: '', description: '', price: '', area: '', rooms: '',
    address: '', city: '', postal_code: '',  // ← Postnummer tillagt
    image_url: '', listing_url: '',
    latitude: '', longitude: '',
    monthly_fee: '', operating_cost: '', floor: '',
    elevator: false, balcony: false,
    images: [] as string[],
    property_type: '', construction_year: '', plot_area: '',
    energy_class: '', association: ''
  })
  const [newImageUrl, setNewImageUrl] = useState('')
  const [geocoding, setGeocoding] = useState(false)

  const isAdmin = session?.user?.role === 'admin'
  const isMaklare = session?.user?.role === 'maklare'

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
    else if (status === 'authenticated' && session) {
      Promise.all([fetchEmails(), fetchAdmins(), fetchProperties()]).finally(() => setLoading(false))
    }
  }, [status, session])

  const fetchEmails = async () => {
    if (!isAdmin) return
    try {
      const res = await fetch('/api/admin/emails')
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      setEmails(data.emails || [])
    } catch (err) { console.error(err) }
  }

  const fetchAdmins = async () => {
    if (!isAdmin) return
    try {
      const res = await fetch('/api/admin/users')
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      setAdmins(data.admins || [])
    } catch (err) { console.error(err) }
  }

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties')
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      let all = data.properties || []
      if (isMaklare && session?.user?.email) {
        all = all.filter((p: Property) => p.created_by === session.user!.email)
      }
      setProperties(all)
    } catch (err) { console.error(err) }
  }

  // Användarhantering
  const addAdmin = async () => {
    setAdminError('')
    if (!newAdminEmail || !newAdminEmail.includes('@')) { setAdminError('Ange en giltig e-postadress'); return }
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
    } catch (err: any) { setAdminError(err.message) }
    finally { setAddingAdmin(false) }
  }

  const updateAdminPassword = async (id: number) => {
    if (!editPassword || editPassword.length < 6) { setAdminError('Lösenordet måste vara minst 6 tecken'); return }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password: editPassword }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kunde inte uppdatera')
      setEditingPasswordId(null); setEditPassword('')
      showSuccess('Lösenord uppdaterat!')
      await fetchAdmins()
    } catch (err: any) { setAdminError(err.message) }
    finally { setSavingPassword(false) }
  }

  const updateAdminRole = async (id: number, newRole: string) => {
    setSavingRole(true)
    try {
      const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role: newRole }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kunde inte uppdatera roll')
      showSuccess('Roll uppdaterad!')
      setEditingRoleId(null)
      await fetchAdmins()
    } catch (err: any) { setAdminError(err.message) }
    finally { setSavingRole(false) }
  }

  const deleteAdmin = async (id: number) => {
    if (!confirm('Är du säker på att du vill ta bort denna användare?')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || 'Kunde inte ta bort')
      showSuccess('Användare borttagen')
      await fetchAdmins()
    } catch (err: any) { setAdminError(err.message) }
    finally { setDeletingId(null) }
  }

  const deleteEmail = async (id: number) => {
    if (!confirm('Radera denna e-postadress?')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/emails', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!res.ok) throw new Error('Kunde inte radera')
      setEmails(emails.filter(e => e.id !== id))
      showSuccess('E-post raderad')
    } catch { alert('Kunde inte radera e-postadressen') }
    finally { setDeletingId(null) }
  }

  const exportCSV = () => {
    const rows = emails.map(e => [e.id, e.email, new Date(e.created_at).toLocaleString('sv-SE')])
    const csv = [['ID', 'E-post', 'Datum'], ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `fyndbo_emails_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Bildhantering
  const addImage = () => {
    if (!newImageUrl) return
    setPropertyForm(prev => ({ ...prev, images: [...prev.images, newImageUrl] }))
    setNewImageUrl('')
  }

  const removeImage = (index: number) => {
    setPropertyForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleGeocode = async () => {
    if (!propertyForm.address || !propertyForm.city) {
      setAdminError('Fyll i adress och stad först')
      return
    }
    setGeocoding(true)
    setAdminError('')
    try {
      const res = await fetch(
        `/api/geocode?address=${encodeURIComponent(propertyForm.address)}&city=${encodeURIComponent(propertyForm.city)}&postal_code=${encodeURIComponent(propertyForm.postal_code)}`
      )
      const data = await res.json()
      if (data.lat && data.lon) {
        setPropertyForm(prev => ({ ...prev, latitude: String(data.lat), longitude: String(data.lon) }))
        showSuccess('Koordinater hittade!')
      } else {
        setAdminError(data.error || 'Kunde inte hitta koordinater')
      }
    } catch { setAdminError('Nätverksfel vid geokodning') }
    finally { setGeocoding(false) }
  }

  const saveProperty = async () => {
    if (!propertyForm.title || !propertyForm.price) return alert('Titel och pris krävs')
    const body: any = {
      ...propertyForm,
      price: Number(propertyForm.price),
      area: propertyForm.area ? Number(propertyForm.area) : null,
      rooms: propertyForm.rooms ? Number(propertyForm.rooms) : null,
      monthly_fee: propertyForm.monthly_fee ? Number(propertyForm.monthly_fee) : null,
      operating_cost: propertyForm.operating_cost ? Number(propertyForm.operating_cost) : null,
      latitude: propertyForm.latitude ? Number(propertyForm.latitude) : null,
      longitude: propertyForm.longitude ? Number(propertyForm.longitude) : null,
      created_by: session?.user?.email,
      images: propertyForm.images.length > 0 ? propertyForm.images : (propertyForm.image_url ? [propertyForm.image_url] : []),
      construction_year: propertyForm.construction_year ? Number(propertyForm.construction_year) : null,
      plot_area: propertyForm.plot_area ? Number(propertyForm.plot_area) : null,
    }
    const method = editingProperty ? 'PUT' : 'POST'
    if (editingProperty) body.id = editingProperty.id

    try {
      const res = await fetch('/api/properties', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.message || `Serverfel (${res.status})`)
      }
      showSuccess(editingProperty ? 'Bostad uppdaterad!' : 'Bostad tillagd!')
      setShowPropertyForm(false)
      setEditingProperty(null)
      setPropertyForm({
        title: '', description: '', price: '', area: '', rooms: '',
        address: '', city: '', postal_code: '',
        image_url: '', listing_url: '',
        latitude: '', longitude: '',
        monthly_fee: '', operating_cost: '', floor: '',
        elevator: false, balcony: false, images: [],
        property_type: '', construction_year: '', plot_area: '',
        energy_class: '', association: ''
      })
      await fetchProperties()
    } catch (err: any) {
      setAdminError(err.message)
    }
  }

  const deleteProperty = async (id: number) => {
    if (!confirm('Ta bort bostad?')) return
    try {
      const res = await fetch(`/api/properties?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Kunde inte ta bort')
      showSuccess('Bostad borttagen')
      await fetchProperties()
    } catch (err: any) { alert(err.message) }
  }

  const sendNewsletter = async () => {
    if (!newsletterSubject || !newsletterContent) return alert('Fyll i ämne och innehåll')
    setSendingNewsletter(true)
    setNewsletterResult(null)
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newsletterSubject, content: newsletterContent, testEmail: newsletterTestEmail || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewsletterResult({ success: true, sent: data.sent })
        setNewsletterSubject(''); setNewsletterContent(''); setNewsletterTestEmail('')
      } else {
        setNewsletterResult({ success: false, error: data.error })
      }
    } catch { setNewsletterResult({ success: false, error: 'Kunde inte skicka' }) }
    finally { setSendingNewsletter(false) }
  }

  const loadTemplate = (key: keyof typeof newsletterTemplates) => {
    setNewsletterSubject(newsletterTemplates[key].subject)
    setNewsletterContent(newsletterTemplates[key].content)
  }

  const handleLogout = () => signOut({ callbackUrl: '/admin/login' })

  const today = new Date().toDateString()
  const emailsToday = emails.filter(e => new Date(e.created_at).toDateString() === today).length
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const emailsThisWeek = emails.filter(e => new Date(e.created_at) >= weekAgo).length
  const filteredEmails = emails.filter(e => e.email.toLowerCase().includes(searchTerm.toLowerCase()))

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-white animate-pulse">Laddar...</p></div>
  }
  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-900">
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/90 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
          {successMsg}
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Sidobar */}
        <aside className="hidden lg:flex flex-col w-72 bg-slate-800/70 border-r border-white/5 p-6">
          <div className="mb-10">
            <img src="https://fyndbo.se/Fyndbo-blue-bkg.png" alt="FyndBo" className="h-56 w-auto mx-auto" />
            <p className="text-slate-500 text-xs text-center mt-2">Dashboard</p>
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'overview' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icons.dashboard /> Översikt</button>
            {isAdmin && (
              <>
                <button onClick={() => setActiveTab('emails')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'emails' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icons.email /> Anmälningar</button>
                <button onClick={() => setActiveTab('admins')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'admins' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icons.users /> Admins</button>
                <button onClick={() => setActiveTab('newsletter')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'newsletter' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icons.newsletter /> Nyhetsbrev</button>
              </>
            )}
            <button onClick={() => setActiveTab('properties')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'properties' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icons.home /> {isMaklare ? 'Mina bostäder' : 'Bostäder'}</button>
          </nav>
          <div className="border-t border-white/5 pt-4 mt-4 space-y-1">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"><Icons.visitSite /> Besök sajten</a>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition w-full"><Icons.logout /> Logga ut</button>
          </div>
        </aside>

        {/* Huvudinnehåll */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-800/50 border-b border-white/5">
            <h1 className="text-lg font-semibold text-white">
              {activeTab === 'overview' && 'Översikt'}
              {activeTab === 'emails' && 'Intresseanmälningar'}
              {activeTab === 'admins' && 'Admin‑användare'}
              {activeTab === 'newsletter' && 'Nyhetsbrev'}
              {activeTab === 'properties' && (isMaklare ? 'Mina bostäder' : 'Bostäder')}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">{session.user?.email}</span>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm transition">Logga ut</button>
            </div>
          </header>

          <div className="lg:hidden bg-slate-800/50 border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">FyndBo</h2>
            <button onClick={handleLogout} className="text-red-400 p-2"><Icons.logout /></button>
          </div>
          <div className="lg:hidden flex gap-1 px-4 py-3 bg-slate-800/30 border-b border-white/5 overflow-x-auto">
            <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition ${activeTab === 'overview' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}>Översikt</button>
            {isAdmin && (
              <>
                <button onClick={() => setActiveTab('emails')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition ${activeTab === 'emails' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}>E‑post</button>
                <button onClick={() => setActiveTab('admins')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition ${activeTab === 'admins' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}>Admins</button>
                <button onClick={() => setActiveTab('newsletter')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition ${activeTab === 'newsletter' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}>Nyhetsbrev</button>
              </>
            )}
            <button onClick={() => setActiveTab('properties')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition ${activeTab === 'properties' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}>{isMaklare ? 'Mina bostäder' : 'Bostäder'}</button>
          </div>

          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            {/* Översikt */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {isAdmin && (
                    <>
                      <div className="bg-white/5 rounded-2xl border border-white/10 p-5"><span className="text-slate-400 text-xs uppercase">Totalt</span><p className="text-3xl font-bold text-white mt-2">{emails.length}</p><p className="text-slate-500 text-xs">anmälningar</p></div>
                      <div className="bg-white/5 rounded-2xl border border-white/10 p-5"><span className="text-slate-400 text-xs uppercase">Idag</span><p className="text-3xl font-bold text-white mt-2">{emailsToday}</p><p className="text-slate-500 text-xs">nya idag</p></div>
                      <div className="bg-white/5 rounded-2xl border border-white/10 p-5"><span className="text-slate-400 text-xs uppercase">Admins</span><p className="text-3xl font-bold text-white mt-2">{admins.length}</p><p className="text-slate-500 text-xs">användare</p></div>
                      <div className="bg-white/5 rounded-2xl border border-white/10 p-5"><span className="text-slate-400 text-xs uppercase">7 dagar</span><p className="text-3xl font-bold text-white mt-2">{emailsThisWeek}</p><p className="text-slate-500 text-xs">denna vecka</p></div>
                    </>
                  )}
                  {isMaklare && (
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-5"><span className="text-slate-400 text-xs uppercase">Mina bostäder</span><p className="text-3xl font-bold text-white mt-2">{properties.length}</p><p className="text-slate-500 text-xs">annonser</p></div>
                  )}
                </div>
              </div>
            )}

            {/* E‑post */}
            {activeTab === 'emails' && isAdmin && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div><h2 className="text-xl font-bold text-white">Intresseanmälningar</h2><p className="text-slate-400 text-sm">{emails.length} registrerade</p></div>
                  <button onClick={exportCSV} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center gap-2"><Icons.export /> Exportera CSV</button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icons.search /></div>
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Sök e‑post..." className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {filteredEmails.length === 0 ? (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center"><p className="text-slate-400">Inga träffar</p></div>
                ) : (
                  <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/5"><tr><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase">#</th><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase">E‑post</th><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase hidden sm:table-cell">Datum</th><th className="text-right py-4 px-6"></th></tr></thead>
                      <tbody>{filteredEmails.map((e, i) => (<tr key={e.id} className="border-b border-white/5 hover:bg-white/5"><td className="py-3.5 px-6 text-slate-500 text-sm">{i + 1}</td><td className="py-3.5 px-6 text-white text-sm">{e.email}</td><td className="py-3.5 px-6 text-slate-400 text-sm hidden sm:table-cell">{new Date(e.created_at).toLocaleString('sv-SE')}</td><td className="py-3.5 px-6 text-right"><button onClick={() => deleteEmail(e.id)} disabled={deletingId === e.id} className="text-red-400 hover:text-red-300 disabled:opacity-30 p-1"><Icons.delete /></button></td></tr>))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Admins */}
            {activeTab === 'admins' && isAdmin && (
              <div className="space-y-6">
                <div><h2 className="text-xl font-bold text-white">Admin‑användare</h2><p className="text-slate-400 text-sm">{admins.length} registrerade</p></div>
                {adminError && (<div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><p className="text-red-300 text-sm">{adminError}</p><button onClick={() => setAdminError('')} className="text-red-400 text-xs mt-1 hover:underline">Stäng</button></div>)}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Icons.add /> Lägg till användare</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="email" value={newAdminEmail} onChange={e => { setNewAdminEmail(e.target.value); setAdminError('') }} placeholder="E‑postadress" className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} placeholder="Lösenord (valfritt)" className="sm:w-48 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={newAdminRole} onChange={e => setNewAdminRole(e.target.value as 'admin' | 'maklare')} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white">
                      <option value="admin">Admin</option>
                      <option value="maklare">Mäklare</option>
                    </select>
                    <button onClick={addAdmin} disabled={addingAdmin} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-white flex items-center gap-2"><Icons.add /> {addingAdmin ? 'Lägger till...' : 'Lägg till'}</button>
                  </div>
                  <p className="text-slate-500 text-xs mt-2 flex items-center gap-1"><Icons.key /> Lösenord är valfritt – utan lösenord loggar användaren in med Google.</p>
                </div>
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  {admins.length === 0 ? (<div className="p-12 text-center"><p className="text-slate-400">Inga användare</p></div>) : (
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/5"><tr><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase">E‑post</th><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase">Roll</th><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase">Inloggning</th><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase hidden md:table-cell">Tillagd</th><th className="text-right py-4 px-6"></th></tr></thead>
                      <tbody>{admins.map(admin => (
                        <tr key={admin.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3.5 px-6 text-white text-sm">{admin.email}</td>
                          <td className="py-3.5 px-6 text-sm" onClick={() => { if (isAdmin) { setEditingRoleId(admin.id); setEditRole(admin.role || 'admin') } }}>
                            {editingRoleId === admin.id ? (
                              <div className="flex items-center gap-1">
                                <select value={editRole} onChange={e => setEditRole(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white">
                                  <option value="admin">Admin</option>
                                  <option value="maklare">Mäklare</option>
                                </select>
                                <button onClick={() => updateAdminRole(admin.id, editRole)} disabled={savingRole} className="text-emerald-400 hover:text-emerald-300 text-xs">Spara</button>
                                <button onClick={() => setEditingRoleId(null)} className="text-slate-400 hover:text-slate-300 text-xs">Avbryt</button>
                              </div>
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${admin.role === 'maklare' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {admin.role || 'admin'}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-6">{admin.has_password ? (<span className="inline-flex items-center gap-1 text-amber-400 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full"><Icons.key /> Lösenord</span>) : (<span className="inline-flex items-center gap-1 text-blue-400 text-xs bg-blue-400/10 px-2.5 py-1 rounded-full"><Icons.google /> Google</span>)}</td>
                          <td className="py-3.5 px-6 text-slate-400 text-sm hidden md:table-cell">{new Date(admin.created_at).toLocaleDateString('sv-SE')}</td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingPasswordId(editingPasswordId === admin.id ? null : admin.id); setEditPassword(''); setAdminError('') }} className="text-amber-400 hover:text-amber-300 p-1"><Icons.edit /></button>
                              <button onClick={() => deleteAdmin(admin.id)} disabled={deletingId === admin.id} className="text-red-400 hover:text-red-300 disabled:opacity-30 p-1"><Icons.delete /></button>
                            </div>
                            {editingPasswordId === admin.id && (
                              <div className="mt-2 flex gap-2">
                                <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Nytt lösenord" className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                <button onClick={() => updateAdminPassword(admin.id)} disabled={savingPassword} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50">Spara</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Nyhetsbrev */}
            {activeTab === 'newsletter' && isAdmin && (
              <div className="space-y-6">
                <div><h2 className="text-xl font-bold text-white">Nyhetsbrev</h2><p className="text-slate-400 text-sm">{emails.length} prenumeranter</p></div>
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <div className="mb-6">
                    <label className="text-slate-400 text-sm block mb-2 flex items-center gap-2"><Icons.template /> Mallar</label>
                    <div className="flex flex-wrap gap-2">{Object.entries(newsletterTemplates).map(([key, tpl]) => (<button key={key} onClick={() => loadTemplate(key as keyof typeof newsletterTemplates)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white border border-white/10">{tpl.name}</button>))}</div>
                  </div>
                  <div className="space-y-4">
                    <input type="text" value={newsletterSubject} onChange={e => setNewsletterSubject(e.target.value)} placeholder="Ämne" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <textarea rows={8} value={newsletterContent} onChange={e => setNewsletterContent(e.target.value)} placeholder="HTML‑innehåll" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
                    <input type="email" value={newsletterTestEmail} onChange={e => setNewsletterTestEmail(e.target.value)} placeholder="Test‑e‑post (valfritt)" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={sendNewsletter} disabled={sendingNewsletter} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center gap-2 font-medium disabled:opacity-50"><Icons.send /> {sendingNewsletter ? 'Skickar...' : `Skicka till ${newsletterTestEmail ? 'testadress' : emails.length + ' prenumeranter'}`}</button>
                    {newsletterResult && (<div className={`p-4 rounded-xl ${newsletterResult.success ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>{newsletterResult.success ? `Skickat till ${newsletterResult.sent} mottagare!` : newsletterResult.error}</div>)}
                  </div>
                </div>
              </div>
            )}

            {/* Bostäder – med alla nya fält */}
            {activeTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">{isMaklare ? 'Mina bostäder' : 'Bostäder'}</h2>
                    <p className="text-slate-400 text-sm">{properties.length} st</p>
                  </div>
                  <button onClick={() => { setEditingProperty(null); setPropertyForm({
                    title: '', description: '', price: '', area: '', rooms: '',
                    address: '', city: '', postal_code: '',
                    image_url: '', listing_url: '',
                    latitude: '', longitude: '',
                    monthly_fee: '', operating_cost: '', floor: '',
                    elevator: false, balcony: false, images: [],
                    property_type: '', construction_year: '', plot_area: '',
                    energy_class: '', association: ''
                  }); setShowPropertyForm(true) }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm flex items-center gap-2"><Icons.add /> Lägg till bostad</button>
                </div>

                {showPropertyForm && (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{editingProperty ? 'Redigera bostad' : 'Ny bostad'}</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><label className="block text-sm text-slate-400 mb-1">Titel *</label><input value={propertyForm.title} onChange={e => setPropertyForm({ ...propertyForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Pris (kr) *</label><input type="number" value={propertyForm.price} onChange={e => setPropertyForm({ ...propertyForm, price: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Area (m²)</label><input type="number" value={propertyForm.area} onChange={e => setPropertyForm({ ...propertyForm, area: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Antal rum</label><input type="number" step="any" value={propertyForm.rooms} onChange={e => setPropertyForm({ ...propertyForm, rooms: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Adress</label><input value={propertyForm.address} onChange={e => setPropertyForm({ ...propertyForm, address: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Postnummer</label><input value={propertyForm.postal_code} onChange={e => setPropertyForm({ ...propertyForm, postal_code: e.target.value })} placeholder="t.ex. 12345" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Stad</label><input value={propertyForm.city} onChange={e => setPropertyForm({ ...propertyForm, city: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Månadsavgift (kr)</label><input type="number" value={propertyForm.monthly_fee} onChange={e => setPropertyForm({ ...propertyForm, monthly_fee: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Driftkostnad (kr/år)</label><input type="number" value={propertyForm.operating_cost} onChange={e => setPropertyForm({ ...propertyForm, operating_cost: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Våning</label><input value={propertyForm.floor} onChange={e => setPropertyForm({ ...propertyForm, floor: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Bostadstyp</label>
                        <select value={propertyForm.property_type} onChange={e => setPropertyForm({ ...propertyForm, property_type: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Välj...</option>
                          <option value="villa">Villa</option>
                          <option value="lägenhet">Lägenhet</option>
                          <option value="radhus">Radhus</option>
                          <option value="fritidshus">Fritidshus</option>
                          <option value="tomt">Tomt</option>
                          <option value="gård">Gård/Skog</option>
                        </select>
                      </div>
                      <div><label className="block text-sm text-slate-400 mb-1">Byggår</label><input type="number" value={propertyForm.construction_year} onChange={e => setPropertyForm({ ...propertyForm, construction_year: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm text-slate-400 mb-1">Tomtarea (m²)</label><input type="number" value={propertyForm.plot_area} onChange={e => setPropertyForm({ ...propertyForm, plot_area: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Energiklass</label>
                        <select value={propertyForm.energy_class} onChange={e => setPropertyForm({ ...propertyForm, energy_class: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Välj...</option>
                          {['A','B','C','D','E','F','G'].map(cls => (<option key={cls} value={cls}>{cls}</option>))}
                        </select>
                      </div>
                      <div><label className="block text-sm text-slate-400 mb-1">Förening</label><input value={propertyForm.association} onChange={e => setPropertyForm({ ...propertyForm, association: e.target.value })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={propertyForm.elevator} onChange={e => setPropertyForm({ ...propertyForm, elevator: e.target.checked })} /> Hiss</label>
                        <label className="flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={propertyForm.balcony} onChange={e => setPropertyForm({ ...propertyForm, balcony: e.target.checked })} /> Balkong</label>
                      </div>
                    </div>

                    {/* Bildhantering */}
                    <div className="mt-6">
                      <label className="block text-sm text-slate-400 mb-1">Bilder (URL:er) – klistra in och klicka Lägg till</label>
                      <div className="flex gap-2 mb-2">
                        <input placeholder="https://bild.se/bild.jpg" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="button" onClick={addImage} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium">Lägg till</button>
                      </div>
                      {propertyForm.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {propertyForm.images.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <img src={url} alt={`bild ${idx+1}`} className="h-20 w-20 object-cover rounded-lg border border-white/10" />
                              <button onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Geokodning */}
                    <div className="mt-4 flex items-center gap-3">
                      <button type="button" onClick={handleGeocode} disabled={geocoding} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center gap-2">
                        {geocoding ? (<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/></svg>) : (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9"/></svg>)}
                        Hitta koordinater
                      </button>
                      {propertyForm.latitude && propertyForm.longitude && <span className="text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg> Hittad</span>}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button onClick={saveProperty} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">Spara</button>
                      <button onClick={() => { setShowPropertyForm(false); setEditingProperty(null) }} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl">Avbryt</button>
                    </div>
                    {adminError && <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-300 text-sm">{adminError}</p></div>}
                  </div>
                )}

                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  {properties.length === 0 ? (
                    <div className="p-12 text-center"><p className="text-slate-400">Inga bostäder tillagda ännu</p></div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/5"><tr><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase">Titel</th><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase">Pris</th><th className="text-left py-4 px-6 text-slate-400 text-xs uppercase hidden sm:table-cell">Stad</th><th className="text-right py-4 px-6"></th></tr></thead>
                      <tbody>{properties.map(p => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3.5 px-6 text-white text-sm">{p.title}</td>
                          <td className="py-3.5 px-6 text-blue-400 text-sm">{new Intl.NumberFormat('sv-SE').format(p.price)} kr</td>
                          <td className="py-3.5 px-6 text-slate-400 text-sm hidden sm:table-cell">{p.city}</td>
                          <td className="py-3.5 px-6 text-right">
                            <button onClick={() => {
                              setEditingProperty(p);
                              setPropertyForm({
                                title: p.title,
                                description: p.description || '',
                                price: String(p.price),
                                area: p.area ? String(p.area) : '',
                                rooms: p.rooms ? String(p.rooms) : '',
                                address: p.address || '',
                                city: p.city || '',
                                postal_code: p.postal_code || '',
                                image_url: p.image_url || '',
                                listing_url: p.listing_url || '',
                                latitude: p.latitude ? String(p.latitude) : '',
                                longitude: p.longitude ? String(p.longitude) : '',
                                monthly_fee: p.monthly_fee ? String(p.monthly_fee) : '',
                                operating_cost: p.operating_cost ? String(p.operating_cost) : '',
                                floor: p.floor || '',
                                elevator: p.elevator || false,
                                balcony: p.balcony || false,
                                images: p.images || [],
                                property_type: p.property_type || '',
                                construction_year: p.construction_year ? String(p.construction_year) : '',
                                plot_area: p.plot_area ? String(p.plot_area) : '',
                                energy_class: p.energy_class || '',
                                association: p.association || ''
                              });
                              setShowPropertyForm(true);
                            }} className="text-amber-400 hover:text-amber-300 p-1"><Icons.edit /></button>
                            <button onClick={() => deleteProperty(p.id)} className="text-red-400 hover:text-red-300 p-1 ml-1"><Icons.delete /></button>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}