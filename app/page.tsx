'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const launchDate = new Date(2026, 5, 24, 10, 0, 0)

    const timer = setInterval(() => {
      const now = new Date()
      const diff = launchDate.getTime() - now.getTime()

      if (diff <= 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (86400000)) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setErrorMsg('Ange en giltig e-postadress')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/save-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Något gick fel')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Kunde inte spara e-post. Försök igen.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Bakgrundsgrid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>
      
      {/* Glödande bubblor */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header - stor logga + Läs mer */}
        <div className="flex justify-between items-center pt-8 pb-16">
          <img src="/FyndBo-blue-bkg.png" alt="FyndBo.se" className="h-32 md:h-48 w-auto hover:scale-105 transition-transform duration-500 drop-shadow-2xl" />
          <Link href="/om" className="group flex items-center gap-2 text-gray-300 hover:text-white transition border border-gray-600 hover:border-blue-500 px-6 py-2.5 rounded-full backdrop-blur-sm bg-white/5">
            <span className="text-sm tracking-wide">Läs mer</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-gray-300 tracking-wider">LANSERAS 24 JUNI 2026</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Hitta ditt
            <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              nästa hem
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Alla bostadsannonser på ett ställe. Sök, jämför och hitta drömhemmet.
          </p>
        </div>

        {/* Timer */}
        <div className="max-w-2xl mx-auto mb-20">
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/10 p-10 shadow-2xl">
            <div className="text-center mb-8">
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Lanseringsnedräkning</p>
            </div>
            <div className="flex justify-center items-center gap-4 md:gap-8">
              {[
                { label: 'DAGAR', value: timeLeft.days },
                { label: 'TIMMAR', value: timeLeft.hours },
                { label: 'MINUTER', value: timeLeft.minutes },
                { label: 'SEKUNDER', value: timeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl md:text-5xl font-mono font-bold text-white bg-gradient-to-b from-white/10 to-white/5 rounded-2xl px-4 py-3 md:px-6 min-w-[80px] shadow-inner">
                    {item.value}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-3 tracking-wide">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulär */}
        <div className="max-w-md mx-auto mb-20">
          <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <h3 className="text-xl font-semibold text-white text-center mb-2">Bli först att få veta</h3>
            <p className="text-gray-400 text-center text-sm mb-6">VIP-inbjudan skickas vid lansering</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.se"
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-gray-500 transition"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-lg"
              >
                {status === 'loading' ? 'SPARAR...' : 'INTRIESSEANMÄLAN →'}
              </button>
            </form>
            
            {status === 'success' && (
              <div className="mt-4 text-center text-sm text-emerald-400 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Tack! Vi återkommer vid lansering.</span>
              </div>
            )}
            {status === 'error' && errorMsg && (
              <div className="mt-4 text-center text-sm text-rose-400">{errorMsg}</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/om" className="text-xs text-gray-500 hover:text-gray-300 transition">Om</Link>
            <span className="text-gray-700">|</span>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition">Integritet</a>
            <span className="text-gray-700">|</span>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition">Villkor</a>
          </div>
          <p className="text-xs text-gray-600">© 2026 FyndBo.se – En plattform för bostadssökande</p>
        </footer>
      </main>
    </div>
  )
}