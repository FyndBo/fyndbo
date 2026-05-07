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
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 relative overflow-hidden">
      {/* Proffsig & glad bakgrund – mjuka former, prickar, gradienter */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Ljusa, glada bubblor */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
          
          {/* Glada prickar (dekorativa) */}
          <div className="absolute top-32 left-[15%] w-2 h-2 bg-yellow-300/40 rounded-full"></div>
          <div className="absolute top-56 right-[20%] w-3 h-3 bg-blue-300/40 rounded-full"></div>
          <div className="absolute bottom-40 left-[25%] w-2 h-2 bg-pink-300/40 rounded-full"></div>
          <div className="absolute bottom-32 right-[30%] w-3 h-3 bg-green-300/40 rounded-full"></div>
          <div className="absolute top-1/3 left-[70%] w-1.5 h-1.5 bg-indigo-300/40 rounded-full"></div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6">
        {/* STÖRRE logga */}
        <div className="flex justify-center pt-12 pb-16">
          <img 
            src="/FyndBo-blue-bkg.png" 
            alt="FyndBo.se" 
            className="h-40 md:h-56 lg:h-72 w-auto hover:scale-105 transition-transform duration-700 drop-shadow-2xl" 
          />
        </div>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-white/80 tracking-wide">✨ Lanseras 24 juni 2026 ✨</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Hitta ditt
            <span className="block bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              nästa hem
            </span>
          </h1>
          
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed text-lg">
            Alla bostadsannonser samlade på ett ställe. ✨ Sök, jämför och hitta drömhemmet.
          </p>
        </div>

        {/* Timer */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-10 text-center shadow-2xl">
            <p className="text-sm text-slate-300 uppercase tracking-wider mb-6">Nedräkning till lansering</p>
            <div className="flex justify-center items-center gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-mono font-bold text-white bg-white/10 rounded-2xl px-4 py-3 min-w-[80px] shadow-inner">
                  {timeLeft.days}
                </div>
                <p className="text-xs text-slate-400 mt-3">DAGAR</p>
              </div>
              <span className="text-slate-500 text-2xl font-light">/</span>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-mono font-bold text-white bg-white/10 rounded-2xl px-4 py-3 min-w-[80px] shadow-inner">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <p className="text-xs text-slate-400 mt-3">TIMMAR</p>
              </div>
              <span className="text-slate-500 text-2xl font-light">/</span>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-mono font-bold text-white bg-white/10 rounded-2xl px-4 py-3 min-w-[80px] shadow-inner">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <p className="text-xs text-slate-400 mt-3">MINUTER</p>
              </div>
              <span className="text-slate-500 text-2xl font-light">/</span>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-mono font-bold text-white bg-white/10 rounded-2xl px-4 py-3 min-w-[80px] shadow-inner">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <p className="text-xs text-slate-400 mt-3">SEKUNDER</p>
              </div>
            </div>
          </div>
        </div>

        {/* Läs mer-knapp */}
        <div className="text-center mb-20">
          <Link 
            href="/om" 
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Upptäck historien bakom FyndBo</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Formulär */}
        <div className="max-w-md mx-auto mb-32">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-2">💌 Bli först att få veta</h3>
            <p className="text-slate-300 text-sm mb-6">VIP-inbjudan skickas direkt vid lansering</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.se"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-white/50 transition"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {status === 'loading' ? 'Sparar...' : 'Intresseanmälan →'}
              </button>
            </form>
            
            {status === 'success' && (
              <div className="mt-4 text-sm text-emerald-300 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Tack! Vi återkommer vid lansering. 🎉</span>
              </div>
            )}
            {status === 'error' && errorMsg && (
              <div className="mt-4 text-sm text-rose-300 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 text-center">
          <p className="text-xs text-slate-400">© 2026 FyndBo.se – En plattform för bostadssökande</p>
        </footer>
      </main>
    </div>
  )
}