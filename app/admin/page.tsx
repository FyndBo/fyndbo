'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
}

// Egna SVG-ikoner (inga emojis)
const Icons = {
  delete: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/>
      <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor"/>
      <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor"/>
    </svg>
  ),
  edit: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3l4 4-7 7-4 1 1-4 6-6z"/>
      <path d="M4 20h16"/>
    </svg>
  ),
  email: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 7l-10 7L2 7"/>
    </svg>
  ),
  users: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  newsletter: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  ),
  export: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  update: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6"/>
      <path d="M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  logout: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  add: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  search: () => (
    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  envelope: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 7l-10 7L2 7"/>
    </svg>
  ),
  star: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

// Färdiga HTML-mallar för nyhetsbrev
const newsletterTemplates = {
  welcome: {
    name: 'Välkommen',
    subject: 'Välkommen till FyndBo.se!',
    content: `<h1 style="font-size: 28px; margin-bottom: 20px;">Välkommen till FyndBo.se!</h1>

<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  Tack för att du anmäler dig till vår VIP-lista! Du är nu en av de första som får veta när vi lanserar.
</p>

<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  Som VIP-medlem får du:
</p>

<ul style="margin-bottom: 30px;">
  <li style="margin-bottom: 10px;">Tidig tillgång till plattformen</li>
  <li style="margin-bottom: 10px;">Exklusiva bostadsannonser före alla andra</li>
  <li style="margin-bottom: 10px;">Rabattkuponger på mäklartjänster</li>
  <li style="margin-bottom: 10px;">Marknadsrapporter direkt i din inkorg</li>
</ul>

<div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
  <p style="margin: 0;"><strong>VIP-bonus:</strong> <span style="color: #3b82f6;">50% rabatt</span> på första annonseringen när vi lanserar!</p>
</div>

<p style="font-size: 14px; color: #64748b;">
  Vi hörs snart!<br>
  — Teamet bakom FyndBo.se
</p>`
  },
  launch: {
    name: 'Lansering',
    subject: 'Lanseringen närmar sig!',
    content: `<h1 style="font-size: 28px; margin-bottom: 10px;">Lanseringen närmar sig!</h1>
<p style="font-size: 18px; color: #3b82f6; margin-bottom: 30px;">24 juni 2026 – bara några veckor kvar!</p>

<div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 30px; border-radius: 16px; margin-bottom: 30px; text-align: center;">
  <p style="font-size: 48px; font-weight: bold; margin: 0;">47</p>
  <p style="margin: 0;">dagar kvar till lansering</p>
</div>

<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  Vi jobbar för fullt med att göra FyndBo.se redo för dig.
</p>

<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  Följ oss på sociala medier för dagliga uppdateringar!
</p>

<div style="display: flex; gap: 15px; margin-bottom: 20px;">
  <a href="#" style="background: #1e293b; padding: 10px 20px; border-radius: 8px; text-decoration: none; color: white;">Instagram</a>
  <a href="#" style="background: #1e293b; padding: 10px 20px; border-radius: 8px; text-decoration: none; color: white;">LinkedIn</a>
  <a href="#" style="background: #1e293b; padding: 10px 20px; border-radius: 8px; text-decoration: none; color: white;">Twitter</a>
</div>

<p style="font-size: 14px; color: #64748b;">
  Vi ses vid lansering!<br>
  — Teamet bakom FyndBo.se
</p>`
  },
  tips: {
    name: 'Tips',
    subject: '5 tips för bostadssökande',
    content: `<h1 style="font-size: 28px; margin-bottom: 20px;">5 tips för bostadssökande</h1>

<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  Att hitta drömhemmet kan vara utmanande. Här är våra bästa tips inför din bostadsjakt:
</p>

<div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 15px;">
  <h3 style="margin: 0 0 10px 0;">1. Sätt en realistisk budget</h3>
  <p style="margin: 0; color: #94a3b8;">Räkna in lagfart, pantbrev och eventuella renoveringar.</p>
</div>

<div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 15px;">
  <h3 style="margin: 0 0 10px 0;">2. Använd vår sökfunktion</h3>
  <p style="margin: 0; color: #94a3b8;">Filtrera på pris, område, storlek och mycket mer.</p>
</div>

<div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 15px;">
  <h3 style="margin: 0 0 10px 0;">3. Gå på visningar</h3>
  <p style="margin: 0; color: #94a3b8;">Inget slår att se bostaden på plats.</p>
</div>

<div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 15px;">
  <h3 style="margin: 0 0 10px 0;">4. Ställ frågor</h3>
  <p style="margin: 0; color: #94a3b8;">Fråga om föreningens ekonomi, renoveringsbehov och grannar.</p>
</div>

<div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
  <h3 style="margin: 0 0 10px 0;">5. Var snabb men noggrann</h3>
  <p style="margin: 0; color: #94a3b8;">Drömhemmet går snabbt – men glöm inte att läsa på ordentligt.</p>
</div>

<p style="font-size: 14px; color: #64748b;">
  Lycka till med bostadsjakten!<br>
  — Teamet bakom FyndBo.se
</p>`
  },
  update: {
    name: 'Uppdatering',
    subject: 'Ny uppdatering från FyndBo.se',
    content: `<h1 style="font-size: 28px; margin-bottom: 20px;">Ny uppdatering från FyndBo.se</h1>

<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  Hej! Vi vill dela med oss av vad som händer just nu:
</p>

<ul style="margin-bottom: 30px;">
  <li style="margin-bottom: 10px;">Bostadssökning med avancerade filter är klar</li>
  <li style="margin-bottom: 10px;">Adminpanel för mäklare är lanserad</li>
  <li style="margin-bottom: 10px;">Kartintegration är under utveckling</li>
  <li style="margin-bottom: 10px;">Designen har uppdaterats för bättre användarupplevelse</li>
</ul>

<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
  Din feedback är viktig för oss! Svara gärna på detta mail med dina tankar och önskemål.
</p>

<p style="font-size: 14px; color: #64748b;">
  Tack för att du är med på vår resa!<br>
  — Teamet bakom FyndBo.se
</p>`
  }
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'emails' | 'admins' | 'newsletter'>('emails')
  const [emails, setEmails] = useState<EmailEntry[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [adminError, setAdminError] = useState('')
  
  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterContent, setNewsletterContent] = useState('')
  const [newsletterTestEmail, setNewsletterTestEmail] = useState('')
  const [sendingNewsletter, setSendingNewsletter] = useState(false)
  const [newsletterResult, setNewsletterResult] = useState<{ success?: boolean; sent?: number; error?: string } | null>(null)

  const router = useRouter()

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/admin/emails')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Kunde inte hämta e-post')
      }
      const data = await res.json()
      setEmails(data.emails || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel')
    }
  }

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Kunde inte hämta admin-användare')
      const data = await res.json()
      setAdmins(data.admins || [])
    } catch (err) {
      console.error(err)
    }
  }

  const addAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      setAdminError('Ange en giltig e-postadress')
      return
    }

    setAddingAdmin(true)
    setAdminError('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Kunde inte lägga till admin')
      }

      setNewAdminEmail('')
      await fetchAdmins()
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Något gick fel')
    } finally {
      setAddingAdmin(false)
    }
  }

  const deleteAdmin = async (id: number) => {
    if (!confirm('Är du säker på att du vill ta bort den här admin-användaren?')) return

    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        throw new Error('Kunde inte ta bort')
      }

      await fetchAdmins()
    } catch (err) {
      alert('Kunde inte ta bort admin-användaren')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteEmail = async (id: number) => {
    if (!confirm('Är du säker på att du vill radera den här e-postadressen?')) return

    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        throw new Error('Kunde inte radera')
      }

      setEmails(emails.filter(email => email.id !== id))
    } catch (err) {
      alert('Kunde inte radera e-postadressen')
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'E-postadress', 'Anmälningsdatum']
    const rows = emails.map(email => [
      email.id,
      email.email,
      new Date(email.created_at).toLocaleString('sv-SE')
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', `fyndbo_emails_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
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
        body: JSON.stringify({
          subject: newsletterSubject,
          content: newsletterContent,
          testEmail: newsletterTestEmail || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setNewsletterResult({ success: true, sent: data.sent })
        setNewsletterSubject('')
        setNewsletterContent('')
        setNewsletterTestEmail('')
      } else {
        setNewsletterResult({ success: false, error: data.error })
      }
    } catch (err) {
      setNewsletterResult({ success: false, error: 'Kunde inte skicka nyhetsbrev' })
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

  const filteredEmails = emails.filter(email =>
    email.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Laddar...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Adminpanel</h1>
              <p className="text-slate-300 text-sm mt-1">Hantera intresseanmälningar, admin-användare och nyhetsbrev</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  fetchEmails()
                  fetchAdmins()
                }}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition border border-blue-500/30 text-sm flex items-center gap-2"
              >
                <Icons.update />
                Uppdatera
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition border border-red-500/30 text-sm flex items-center gap-2"
              >
                <Icons.logout />
                Logga ut
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-5 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'emails'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Icons.email />
            Intresseanmälningar
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-5 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'admins'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Icons.users />
            Admin-användare
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`px-5 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'newsletter'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Icons.newsletter />
            Nyhetsbrev
          </button>
        </div>

        {/* Flik: Intresseanmälningar */}
        {activeTab === 'emails' && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Totalt antal anmälningar</p>
                    <p className="text-4xl font-bold text-white mt-2">{emails.length}</p>
                  </div>
                  <Icons.envelope />
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl border border-white/20 p-6 relative">
                <Icons.search />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="exempel@epost.se"
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            {filteredEmails.length === 0 ? (
              <div className="bg-white/10 rounded-2xl border border-white/20 p-12 text-center">
                <p className="text-slate-300 text-lg">Inga e-postadresser insamlade ännu.</p>
              </div>
            ) : (
              <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/20">
                      <tr>
                        <th className="text-left py-4 px-6 text-white">#</th>
                        <th className="text-left py-4 px-6 text-white">E-post</th>
                        <th className="text-left py-4 px-6 text-white">Datum</th>
                        <th className="text-center py-4 px-6 text-white"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmails.map((email, index) => (
                        <tr key={email.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-6 text-slate-400">{index + 1}</td>
                          <td className="py-3 px-6 text-white">{email.email}</td>
                          <td className="py-3 px-6 text-slate-400">{new Date(email.created_at).toLocaleString('sv-SE')}</td>
                          <td className="py-3 px-6 text-center">
                            <button onClick={() => handleDeleteEmail(email.id)} className="text-red-400 hover:text-red-300">
                              <Icons.delete />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white/5 px-6 py-4 flex justify-between">
                  <p className="text-slate-400 text-sm">Visar {filteredEmails.length} av {emails.length}</p>
                  <button onClick={handleExportCSV} className="text-green-400 text-sm hover:text-green-300 flex items-center gap-1">
                    <Icons.export />
                    Exportera CSV
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Flik: Admin-användare */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Lägg till admin</h2>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="exempel@epost.se"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50"
                />
                <button onClick={addAdmin} disabled={addingAdmin} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white flex items-center gap-1">
                  <Icons.add />
                  Lägg till
                </button>
              </div>
              {adminError && <p className="text-red-400 mt-2">{adminError}</p>}
            </div>

            <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/20">
                <h2 className="text-xl font-semibold text-white">Befintliga admin</h2>
              </div>
              {admins.length === 0 ? (
                <div className="p-12 text-center text-slate-400">Inga admin-användare</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/20">
                      <tr>
                        <th className="text-left py-4 px-6 text-white">E-post</th>
                        <th className="text-left py-4 px-6 text-white">Tillagd</th>
                        <th className="text-center py-4 px-6 text-white"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id} className="border-b border-white/10">
                          <td className="py-3 px-6 text-white">{admin.email}</td>
                          <td className="py-3 px-6 text-slate-400">{new Date(admin.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-6 text-center">
                            <button onClick={() => deleteAdmin(admin.id)} className="text-red-400 hover:text-red-300">
                              <Icons.delete />
                            </button>
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

        {/* Flik: Nyhetsbrev */}
        {activeTab === 'newsletter' && (
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Skicka nyhetsbrev</h2>
            <p className="text-slate-300 text-sm mb-6">Skickas till {emails.length} prenumeranter</p>

            {/* Mallar */}
            <div className="mb-6">
              <label className="text-slate-300 text-sm block mb-2">Välj mall (valfritt)</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => loadTemplate('welcome')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition flex items-center gap-1"
                >
                  <Icons.star />
                  Välkommen
                </button>
                <button
                  onClick={() => loadTemplate('launch')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition"
                >
                  Lansering
                </button>
                <button
                  onClick={() => loadTemplate('tips')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition"
                >
                  Tips
                </button>
                <button
                  onClick={() => loadTemplate('update')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition"
                >
                  Uppdatering
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm block mb-1">Ämne</label>
                <input
                  type="text"
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                  placeholder="T.ex. Uppdatering från FyndBo.se"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-1">Innehåll (HTML)</label>
                <textarea
                  rows={8}
                  value={newsletterContent}
                  onChange={(e) => setNewsletterContent(e.target.value)}
                  placeholder="<h1>Välkommen!</h1><p>Här är en uppdatering...</p>"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 font-mono text-sm"
                />
                <p className="text-slate-500 text-xs mt-1">Du kan använda HTML för att formatera innehållet</p>
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-1">Test-e-post (valfritt)</label>
                <input
                  type="email"
                  value={newsletterTestEmail}
                  onChange={(e) => setNewsletterTestEmail(e.target.value)}
                  placeholder="test@epost.se – skickar endast till denna adress"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50"
                />
              </div>

              <button
                onClick={sendNewsletter}
                disabled={sendingNewsletter}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2"
              >
                <Icons.newsletter />
                {sendingNewsletter ? 'Skickar...' : 'Skicka nyhetsbrev'}
              </button>

              {newsletterResult && (
                <div className={`mt-4 p-3 rounded-xl ${newsletterResult.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {newsletterResult.success 
                    ? `Nyhetsbrev skickat till ${newsletterResult.sent} mottagare!`
                    : `Fel: ${newsletterResult.error}`
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}