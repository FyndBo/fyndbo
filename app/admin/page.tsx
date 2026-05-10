'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

interface EmailEntry {
  id: number
  email: string
  created_at: string
}

interface AdminUser {
  id: number
  email: string
  created_at: string
  added_by: string | null
  has_password: boolean
}

// ============================================================
// ALLA SVG-IKONER
// ============================================================
const Icons = {
  dashboard: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="9" height="9" rx="1.5" stroke="currentColor" fill="none"/>
      <rect x="13" y="2" width="9" height="9" rx="1.5" stroke="currentColor" fill="none"/>
      <rect x="2" y="13" width="9" height="9" rx="1.5" stroke="currentColor" fill="none"/>
      <rect x="13" y="13" width="9" height="9" rx="1.5" stroke="currentColor" fill="none"/>
    </svg>
  ),
  users: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="7" r="3" stroke="currentColor" fill="none"/>
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <circle cx="17" cy="6" r="2" stroke="currentColor" fill="none"/>
      <path d="M15 14c2.5 0 4.5 1.5 5.5 3.5" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  newsletter: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12l-9 6-9-6" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 6v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2z" stroke="currentColor" fill="none"/>
      <path d="M3 6l9 6 9-6" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  totalEmails: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" fill="none"/>
      <path d="M2 8l10 7 10-7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  todayEmails: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none"/>
      <path d="M12 7v5l3 3" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  totalAdmins: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="7" r="3" stroke="currentColor" fill="none"/>
      <path d="M3 20c0-3.3 2.7-6 6-6" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <circle cx="17" cy="6" r="2" stroke="currentColor" fill="none"/>
      <path d="M21 20c0-3.3-2.7-6-6-6" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M12 14c2.2 0 4 1.8 4 4" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  thisWeek: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="18" rx="2" stroke="currentColor" fill="none"/>
      <path d="M2 10h20" stroke="currentColor" fill="none"/>
      <path d="M16 2v4M8 2v4" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  update: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  logout: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16 17 21 12 16 7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  add: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none"/>
      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  delete: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none"/>
      <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  edit: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  export: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="7 10 12 15 17 10" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  search: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" fill="none" strokeLinecap="round"/>
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
  key: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="12" r="5" stroke="currentColor" fill="none"/>
      <path d="M12.5 8.5L21 2" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M18 5l2 2" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M15 8l2 2" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  template: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="16" rx="2" stroke="currentColor" fill="none"/>
      <path d="M2 8h20" stroke="currentColor" fill="none"/>
      <path d="M7 5v3M10 5v3" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  send: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  visitSite: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="15 3 21 3 21 9" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  check: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none"/>
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

// Nyhetsbrevsmallar
const newsletterTemplates = {
  welcome: {
    name: 'Välkommen',
    subject: 'Välkommen till FyndBo.se!',
    content: `<h1 style="font-size: 28px; margin-bottom: 20px;">Välkommen till FyndBo.se!</h1>
<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Tack för att du anmäler dig till vår VIP-lista!</p>
<p style="font-size: 14px; color: #64748b;">Vi hörs snart! — Teamet bakom FyndBo.se</p>`
  },
  launch: {
    name: 'Lansering',
    subject: 'Lanseringen närmar sig!',
    content: `<h1 style="font-size: 28px; margin-bottom: 10px;">Lanseringen närmar sig!</h1><p style="font-size: 16px;">Vi jobbar för fullt!</p>`
  },
  tips: {
    name: 'Bostadstips',
    subject: '5 tips för bostadssökande',
    content: `<h1 style="font-size: 28px;">5 tips för bostadssökande</h1><p>Här är våra bästa tips!</p>`
  },
  update: {
    name: 'Uppdatering',
    subject: 'Ny uppdatering från FyndBo.se',
    content: `<h1 style="font-size: 28px;">Ny uppdatering!</h1><p>Här är de senaste nyheterna.</p>`
  }
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'overview' | 'emails' | 'admins' | 'newsletter'>('overview')
  const [emails, setEmails] = useState<EmailEntry[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [adminError, setAdminError] = useState('')

  // Admin-formulär
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)

  // Lösenordsändring
  const [editingPasswordId, setEditingPasswordId] = useState<number | null>(null)
  const [editPassword, setEditPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // Nyhetsbrev
  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterContent, setNewsletterContent] = useState('')
  const [newsletterTestEmail, setNewsletterTestEmail] = useState('')
  const [sendingNewsletter, setSendingNewsletter] = useState(false)
  const [newsletterResult, setNewsletterResult] = useState<{ success?: boolean; sent?: number; error?: string } | null>(null)

  const router = useRouter()

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/admin/emails')
      if (!res.ok) {
        if (res.status === 401) { router.push('/admin/login'); return }
        return
      }
      const data = await res.json()
      setEmails(data.emails || [])
    } catch (err) {
      console.error('fetchEmails error:', err)
    }
  }

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users')
      
      if (!res.ok) {
        if (res.status === 401) { 
          router.push('/admin/login')
          return 
        }
        const errorData = await res.json().catch(() => ({}))
        console.error('API error:', errorData)
        return
      }
      
      const data = await res.json()
      
      if (data.admins) {
        setAdmins(data.admins)
      } else if (Array.isArray(data)) {
        setAdmins(data)
      } else {
        console.error('Oväntat format:', data)
        setAdmins([])
      }
    } catch (err) {
      console.error('fetchAdmins error:', err)
    }
  }

  const addAdmin = async () => {
    setAdminError('')
    
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      setAdminError('Ange en giltig e-postadress')
      return
    }

    setAddingAdmin(true)

    try {
      const body: any = { email: newAdminEmail.trim().toLowerCase() }
      
      if (newAdminPassword && newAdminPassword.length > 0) {
        body.password = newAdminPassword
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Kunde inte lägga till admin')
      }

      showSuccess(`${newAdminEmail} har lagts till som admin`)
      setNewAdminEmail('')
      setNewAdminPassword('')
      await fetchAdmins()
    } catch (err: any) {
      setAdminError(err.message || 'Något gick fel')
    } finally {
      setAddingAdmin(false)
    }
  }

  const updateAdminPassword = async (id: number) => {
    if (!editPassword || editPassword.length < 6) { 
      setAdminError('Lösenordet måste vara minst 6 tecken')
      return 
    }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/admin/users', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id, password: editPassword }) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kunde inte uppdatera lösenord')
      setEditingPasswordId(null)
      setEditPassword('')
      showSuccess('Lösenord uppdaterat!')
      await fetchAdmins()
    } catch (err: any) {
      setAdminError(err.message || 'Något gick fel')
    } finally {
      setSavingPassword(false)
    }
  }

  const deleteAdmin = async (id: number) => {
    if (!confirm('Är du säker på att du vill ta bort denna admin?')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/users', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id }) 
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kunde inte ta bort')
      showSuccess('Admin borttagen')
      await fetchAdmins()
    } catch (err: any) {
      setAdminError(err.message || 'Kunde inte ta bort admin')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteEmail = async (id: number) => {
    if (!confirm('Radera denna e-postadress?')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/emails', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id }) 
      })
      if (!res.ok) throw new Error('Kunde inte radera')
      setEmails(emails.filter(email => email.id !== id))
      showSuccess('E-post raderad')
    } catch (err) {
      alert('Kunde inte radera e-postadressen')
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'E-postadress', 'Anmälningsdatum']
    const rows = emails.map(email => [email.id, email.email, new Date(email.created_at).toLocaleString('sv-SE')])
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `fyndbo_emails_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  const sendNewsletter = async () => {
    if (!newsletterSubject || !newsletterContent) { 
      alert('Fyll i både ämne och innehåll')
      return 
    }
    setSendingNewsletter(true)
    setNewsletterResult(null)
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newsletterSubject, content: newsletterContent, testEmail: newsletterTestEmail || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewsletterResult({ success: true, sent: data.sent })
        setNewsletterSubject(''); setNewsletterContent(''); setNewsletterTestEmail('')
      } else {
        setNewsletterResult({ success: false, error: data.error })
      }
    } catch (err) {
      setNewsletterResult({ success: false, error: 'Kunde inte skicka' })
    } finally {
      setSendingNewsletter(false)
    }
  }

  const loadTemplate = (templateKey: keyof typeof newsletterTemplates) => {
    const template = newsletterTemplates[templateKey]
    setNewsletterSubject(template.subject)
    setNewsletterContent(template.content)
  }

  useEffect(() => {
    Promise.all([fetchEmails(), fetchAdmins()]).finally(() => setLoading(false))
  }, [])

  // Statistik
  const today = new Date().toDateString()
  const emailsToday = emails.filter(e => new Date(e.created_at).toDateString() === today).length
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const emailsThisWeek = emails.filter(e => new Date(e.created_at) >= weekAgo).length

  const filteredEmails = emails.filter(email =>
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Laddar adminpanelen...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/90 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Icons.check />
          {successMsg}
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Sidobar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-800/50 border-r border-white/5 p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white">FyndBo</h2>
            <p className="text-slate-500 text-xs mt-1">Adminpanel</p>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${activeTab === 'overview' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icons.dashboard /> Översikt
            </button>
            <button onClick={() => setActiveTab('emails')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${activeTab === 'emails' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icons.totalEmails /> Anmälningar
            </button>
            <button onClick={() => setActiveTab('admins')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${activeTab === 'admins' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icons.users /> Admins
            </button>
            <button onClick={() => setActiveTab('newsletter')} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${activeTab === 'newsletter' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icons.newsletter /> Nyhetsbrev
            </button>
          </nav>

          <div className="border-t border-white/5 pt-4 mt-4 space-y-1">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition">
              <Icons.visitSite /> Besök sajten
            </a>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition w-full">
              <Icons.logout /> Logga ut
            </button>
          </div>
        </aside>

        {/* Huvudinnehåll */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobil-header */}
          <header className="lg:hidden bg-slate-800/50 border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">FyndBo Admin</h2>
            <button onClick={handleLogout} className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition"><Icons.logout /></button>
          </header>

          {/* Mobil-tabs */}
          <div className="lg:hidden flex gap-1 px-4 py-3 bg-slate-800/30 border-b border-white/5 overflow-x-auto">
            {[
              { key: 'overview' as const, label: 'Översikt' },
              { key: 'emails' as const, label: 'E-post' },
              { key: 'admins' as const, label: 'Admins' },
              { key: 'newsletter' as const, label: 'Nyhetsbrev' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition ${activeTab === tab.key ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}>{tab.label}</button>
            ))}
          </div>

          {/* Innehåll */}
          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            {/* ========== ÖVERSIKT ========== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Översikt</h1>
                  <p className="text-slate-400 text-sm mt-1">Välkommen, {session?.user?.email || 'Admin'}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Totalt', value: emails.length, sub: 'anmälningar', icon: <Icons.totalEmails />, color: 'text-blue-400' },
                    { label: 'Idag', value: emailsToday, sub: 'nya idag', icon: <Icons.todayEmails />, color: 'text-emerald-400' },
                    { label: 'Admins', value: admins.length, sub: 'användare', icon: <Icons.totalAdmins />, color: 'text-purple-400' },
                    { label: '7 dagar', value: emailsThisWeek, sub: 'nya denna vecka', icon: <Icons.thisWeek />, color: 'text-amber-400' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/5 rounded-2xl border border-white/10 p-5 hover:border-white/20 transition">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-xs uppercase tracking-wider">{stat.label}</span>
                        <span className={stat.color}>{stat.icon}</span>
                      </div>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <p className="text-slate-500 text-xs mt-1">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== E-POST ========== */}
            {activeTab === 'emails' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Intresseanmälningar</h1>
                    <p className="text-slate-400 text-sm">{emails.length} registrerade</p>
                  </div>
                  <button onClick={handleExportCSV} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition border border-emerald-500/30 text-sm flex items-center gap-2">
                    <Icons.export /> Exportera CSV
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.search />
                  </div>
                  <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Sök e-postadress..." 
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>

                {filteredEmails.length === 0 ? (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                    <p className="text-slate-400 text-lg">{searchTerm ? 'Inga träffar' : 'Inga e-postadresser ännu'}</p>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/5">
                          <tr>
                            <th className="text-left py-4 px-6 text-slate-400 text-xs uppercase tracking-wider font-medium">#</th>
                            <th className="text-left py-4 px-6 text-slate-400 text-xs uppercase tracking-wider font-medium">E-post</th>
                            <th className="text-left py-4 px-6 text-slate-400 text-xs uppercase tracking-wider font-medium hidden sm:table-cell">Datum</th>
                            <th className="text-right py-4 px-6 text-slate-400 text-xs uppercase tracking-wider font-medium"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmails.map((email, index) => (
                            <tr key={email.id} className="border-b border-white/5 hover:bg-white/5 transition">
                              <td className="py-3.5 px-6 text-slate-500 text-sm">{index + 1}</td>
                              <td className="py-3.5 px-6 text-white text-sm">{email.email}</td>
                              <td className="py-3.5 px-6 text-slate-400 text-sm hidden sm:table-cell">{new Date(email.created_at).toLocaleString('sv-SE')}</td>
                              <td className="py-3.5 px-6 text-right">
                                <button onClick={() => handleDeleteEmail(email.id)} disabled={deletingId === email.id} className="text-red-400 hover:text-red-300 disabled:opacity-30 transition p-1" title="Radera"><Icons.delete /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========== ADMINS ========== */}
            {activeTab === 'admins' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Admin-användare</h1>
                  <p className="text-slate-400 text-sm">{admins.length} registrerade</p>
                </div>

                {adminError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-300 text-sm">{adminError}</p>
                    <button onClick={() => setAdminError('')} className="text-red-400 text-xs mt-1 hover:underline">Stäng</button>
                  </div>
                )}

                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Icons.add /> Lägg till admin</h2>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="email" 
                        value={newAdminEmail} 
                        onChange={(e) => { setNewAdminEmail(e.target.value); setAdminError('') }} 
                        placeholder="admin@exempel.se" 
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                      <input 
                        type="password" 
                        value={newAdminPassword} 
                        onChange={(e) => setNewAdminPassword(e.target.value)} 
                        placeholder="Lösenord (valfritt)" 
                        className="sm:w-48 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                      <button 
                        onClick={addAdmin} 
                        disabled={addingAdmin} 
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-white flex items-center gap-2 transition font-medium"
                      >
                        <Icons.add /> 
                        {addingAdmin ? 'Lägger till...' : 'Lägg till'}
                      </button>
                    </div>
                    <p className="text-slate-500 text-xs flex items-center gap-1">
                      <Icons.key /> Lösenord är valfritt – utan lösenord loggar admin in med Google.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  {admins.length === 0 ? (
                    <div className="p-12 text-center"><p className="text-slate-400">Inga admin-användare</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/5">
                          <tr>
                            <th className="text-left py-4 px-6 text-slate-400 text-xs uppercase tracking-wider">E-post</th>
                            <th className="text-left py-4 px-6 text-slate-400 text-xs uppercase tracking-wider">Inloggning</th>
                            <th className="text-left py-4 px-6 text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">Tillagd</th>
                            <th className="text-right py-4 px-6 text-slate-400 text-xs uppercase tracking-wider">Åtgärder</th>
                          </tr>
                        </thead>
                        <tbody>
                          {admins.map((admin) => (
                            <tr key={admin.id} className="border-b border-white/5 hover:bg-white/5 transition">
                              <td className="py-3.5 px-6 text-white text-sm">{admin.email}</td>
                              <td className="py-3.5 px-6">
                                {admin.has_password ? (
                                  <span className="inline-flex items-center gap-1 text-amber-400 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full"><Icons.key /> Lösenord</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-blue-400 text-xs bg-blue-400/10 px-2.5 py-1 rounded-full"><Icons.google /> Google</span>
                                )}
                              </td>
                              <td className="py-3.5 px-6 text-slate-400 text-sm hidden md:table-cell">{new Date(admin.created_at).toLocaleDateString('sv-SE')}</td>
                              <td className="py-3.5 px-6 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => { setEditingPasswordId(editingPasswordId === admin.id ? null : admin.id); setEditPassword(''); setAdminError('') }} className="text-amber-400 hover:text-amber-300 transition p-1" title="Ändra lösenord"><Icons.edit /></button>
                                  <button onClick={() => deleteAdmin(admin.id)} disabled={deletingId === admin.id} className="text-red-400 hover:text-red-300 disabled:opacity-30 transition p-1" title="Ta bort"><Icons.delete /></button>
                                </div>
                                {editingPasswordId === admin.id && (
                                  <div className="mt-2 flex gap-2">
                                    <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Nytt lösenord (min 6 tecken)" className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                    <button onClick={() => updateAdminPassword(admin.id)} disabled={savingPassword} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50 whitespace-nowrap">{savingPassword ? 'Sparar...' : 'Spara'}</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== NYHETSBREV ========== */}
            {activeTab === 'newsletter' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Nyhetsbrev</h1>
                  <p className="text-slate-400 text-sm">Skicka till {emails.length} prenumeranter</p>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <div className="mb-6">
                    <label className="text-slate-400 text-sm block mb-2 flex items-center gap-2"><Icons.template /> Mallar</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(newsletterTemplates).map(([key, template]) => (
                        <button key={key} onClick={() => loadTemplate(key as keyof typeof newsletterTemplates)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white transition border border-white/10">{template.name}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Ämne *</label>
                      <input type="text" value={newsletterSubject} onChange={(e) => setNewsletterSubject(e.target.value)} placeholder="T.ex. Välkommen till FyndBo.se!" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Innehåll (HTML) *</label>
                      <textarea rows={8} value={newsletterContent} onChange={(e) => setNewsletterContent(e.target.value)} placeholder="<h1>Hej!</h1><p>Skriv ditt nyhetsbrev här...</p>" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">Test-e-post (valfritt)</label>
                      <input type="email" value={newsletterTestEmail} onChange={(e) => setNewsletterTestEmail(e.target.value)} placeholder="test@epost.se" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={sendNewsletter} disabled={sendingNewsletter} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2 font-medium">
                      <Icons.send /> {sendingNewsletter ? 'Skickar...' : `Skicka till ${newsletterTestEmail ? 'testadress' : emails.length + ' prenumeranter'}`}
                    </button>
                    {newsletterResult && (
                      <div className={`p-4 rounded-xl ${newsletterResult.success ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
                        {newsletterResult.success ? `Skickat till ${newsletterResult.sent} mottagare!` : newsletterResult.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}