'use client'
import { useState } from 'react'

export default function AvregistreraPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/avregistrera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage('Du har avregistrerats från vårt nyhetsbrev.')
      } else {
        setStatus('error')
        setMessage(data.error || 'Något gick fel.')
      }
    } catch {
      setStatus('error')
      setMessage('Kunde inte ansluta till servern.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <img
            src="https://fyndbo.se/Fyndbo-blue-bkg.png"
            alt="FyndBo"
            className="h-56 sm:h-48 md:h-56 lg:h-64 xl:h-72 2xl:h-80 mx-auto w-auto drop-shadow-xl"
          />
          <h1 className="text-2xl font-bold text-white mt-4">Avregistrera</h1>
          <p className="text-slate-400 text-sm mt-2">
            Ledsen att du vill lämna oss. Fyll i din e‑postadress för att avsluta prenumerationen.
          </p>
        </div>

        {status === 'success' ? (
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
            <p className="text-emerald-300">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">E‑postadress</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.se"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                  </svg>
                  Avregistrerar...
                </>
              ) : (
                'Avregistrera'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}