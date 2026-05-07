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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'emails' | 'admins'>('emails')
  const [emails, setEmails] = useState<EmailEntry[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [adminError, setAdminError] = useState('')
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
              <h1 className="text-2xl md:text-3xl font-bold text-white">📋 Adminpanel</h1>
              <p className="text-slate-300 text-sm mt-1">Hantera intresseanmälningar och admin-användare</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  fetchEmails()
                  fetchAdmins()
                }}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition border border-blue-500/30 text-sm flex items-center gap-2"
              >
                🔄 Uppdatera
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition border border-red-500/30 text-sm flex items-center gap-2"
              >
                🚪 Logga ut
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-6 py-2 rounded-xl transition ${
              activeTab === 'emails'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            📧 Intresseanmälningar
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-6 py-2 rounded-xl transition ${
              activeTab === 'admins'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            👥 Admin-användare
          </button>
        </div>

        {/* Flik: Intresseanmälningar */}
        {activeTab === 'emails' && (
          <>
            {/* Statistik + Sök */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Totalt antal anmälningar</p>
                    <p className="text-4xl font-bold text-white mt-2">{emails.length}</p>
                  </div>
                  <div className="text-5xl opacity-50">📧</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <label className="text-slate-300 text-sm block mb-2">🔍 Sök efter e-post</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="exempel@epost.se"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-white/50"
                />
              </div>
            </div>

            {/* Tabell */}
            {error ? (
              <div className="bg-red-500/20 rounded-2xl border border-red-500/30 p-8 text-center">
                <p className="text-red-300">{error}</p>
                <button
                  onClick={fetchEmails}
                  className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition"
                >
                  Försök igen
                </button>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
                <div className="text-5xl mb-4 opacity-50">📭</div>
                <p className="text-slate-300 text-lg">
                  {searchTerm ? 'Inga e-post matchar din sökning.' : 'Inga e-postadresser insamlade ännu.'}
                </p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/20">
                      <tr>
                        <th className="text-left py-4 px-6 text-white font-medium text-sm">#</th>
                        <th className="text-left py-4 px-6 text-white font-medium text-sm">📧 E-postadress</th>
                        <th className="text-left py-4 px-6 text-white font-medium text-sm">📅 Anmälningsdatum</th>
                        <th className="text-center py-4 px-6 text-white font-medium text-sm">🗑️ Radera</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmails.map((email, index) => (
                        <tr key={email.id} className="border-b border-white/10 hover:bg-white/5 transition group">
                          <td className="py-3 px-6 text-slate-400 text-sm">{index + 1}</td>
                          <td className="py-3 px-6">
                            <span className="text-white font-mono text-sm break-all">{email.email}</span>
                          </td>
                          <td className="py-3 px-6 text-slate-400 text-sm whitespace-nowrap">
                            {new Date(email.created_at).toLocaleString('sv-SE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <button
                              onClick={() => handleDeleteEmail(email.id)}
                              disabled={deletingId === email.id}
                              className="text-red-400 hover:text-red-300 transition disabled:opacity-50"
                              title="Radera e-post"
                            >
                              {deletingId === email.id ? '⏳' : '🗑️'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white/5 border-t border-white/20 px-6 py-4 flex justify-between items-center flex-wrap gap-2">
                  <p className="text-slate-400 text-sm">
                    Visar {filteredEmails.length} av {emails.length} anmälningar
                    {searchTerm && ` (filtrerat på "${searchTerm}")`}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                      Rensa sökning
                    </button>
                  )}
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition"
                  >
                    📥 Exportera CSV
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Flik: Admin-användare */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            {/* Lägg till ny admin */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">➕ Lägg till admin-användare</h2>
              <p className="text-slate-300 text-sm mb-4">
                Ange e-postadressen till den som ska få tillgång till adminpanelen via Google-inloggning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="exempel@epost.se"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-white/50"
                />
                <button
                  onClick={addAdmin}
                  disabled={addingAdmin}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition disabled:opacity-50"
                >
                  {addingAdmin ? 'Lägger till...' : 'Lägg till admin'}
                </button>
              </div>
              {adminError && (
                <p className="text-red-400 text-sm mt-3">{adminError}</p>
              )}
            </div>

            {/* Lista över admin-användare */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/20">
                <h2 className="text-xl font-semibold text-white">👥 Befintliga admin-användare</h2>
                <p className="text-slate-300 text-sm mt-1">Dessa e-postadresser kan logga in med Google</p>
              </div>
              {admins.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400">Inga admin-användare har lagts till än.</p>
                  <p className="text-slate-500 text-sm mt-1">Lägg till din e-post ovan för att komma åt adminpanelen.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/20">
                      <tr>
                        <th className="text-left py-4 px-6 text-white font-medium text-sm">E-postadress</th>
                        <th className="text-left py-4 px-6 text-white font-medium text-sm">Tillagd</th>
                        <th className="text-left py-4 px-6 text-white font-medium text-sm">Tillagd av</th>
                        <th className="text-center py-4 px-6 text-white font-medium text-sm">Åtgärd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id} className="border-b border-white/10 hover:bg-white/5 transition">
                          <td className="py-3 px-6">
                            <span className="text-white font-mono text-sm">{admin.email}</span>
                          </td>
                          <td className="py-3 px-6 text-slate-400 text-sm">
                            {new Date(admin.created_at).toLocaleString('sv-SE')}
                          </td>
                          <td className="py-3 px-6 text-slate-400 text-sm">
                            {admin.added_by || '-'}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <button
                              onClick={() => deleteAdmin(admin.id)}
                              disabled={deletingId === admin.id}
                              className="text-red-400 hover:text-red-300 transition disabled:opacity-50"
                              title="Ta bort admin"
                            >
                              {deletingId === admin.id ? '⏳' : '🗑️'}
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
      </div>
    </div>
  )
}