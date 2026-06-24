'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Ändrat till 31 juli 2026 kl. 10:00
    const launchDate = new Date(2026, 6, 31, 10, 0, 0)

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
        hours: Math.floor((diff % 86400000) / 3600000),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Bakgrundsdekorationer */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Logga */}
        <div className="flex justify-center pt-2 pb-3 sm:pt-4 sm:pb-6">
          <img 
            src="/Fyndbo-blue-bkg.png" 
            alt="FyndBo.se" 
            className="h-64 sm:h-56 md:h-64 lg:h-72 xl:h-80 2xl:h-96 w-auto hover:scale-105 transition-transform duration-500 drop-shadow-xl" 
          />
        </div>

        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs text-gray-300 tracking-wide">Lanseras 31 juli 2026</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 leading-[1.1] tracking-tight">
            Hitta ditt
            <span className="block bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              nästa hem
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-2">
            Alla bostadsannonser samlade på ett ställe. Sök, jämför och hitta drömhemmet.
          </p>
        </div>

        <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/20 p-5 sm:p-6 md:p-10 text-center shadow-2xl">
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase tracking-wider mb-3 sm:mb-4 md:mb-6">Nedräkning till lansering</p>
            <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-white bg-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 md:py-3 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] shadow-inner">
                  {timeLeft.days}
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-1 sm:mt-2">DAGAR</p>
              </div>
              <span className="text-gray-500 text-lg sm:text-2xl md:text-3xl font-light">/</span>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-white bg-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 md:py-3 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] shadow-inner">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-1 sm:mt-2">TIMMAR</p>
              </div>
              <span className="text-gray-500 text-lg sm:text-2xl md:text-3xl font-light">/</span>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-white bg-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 md:py-3 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] shadow-inner">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-1 sm:mt-2">MINUTER</p>
              </div>
              <span className="text-gray-500 text-lg sm:text-2xl md:text-3xl font-light">/</span>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-white bg-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 md:py-3 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] shadow-inner">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 mt-1 sm:mt-2">SEKUNDER</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8 sm:mb-10">
          <Link 
            href="/om" 
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
          >
            <span>Upptäck historien bakom FyndBo</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="max-w-md mx-auto mb-10 sm:mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 p-5 sm:p-8 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Bli först att få veta</h3>
            <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">VIP-inbjudan skickas direkt vid lansering</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.se"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-white/50 text-sm sm:text-base transition"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md text-sm sm:text-base"
              >
                {status === 'loading' ? 'Sparar...' : 'Intresseanmälan →'}
              </button>
            </form>
            
            {status === 'success' && (
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-emerald-300">✓ Tack! Vi återkommer vid lansering.</p>
            )}
            {status === 'error' && errorMsg && (
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-rose-300">✗ {errorMsg}</p>
            )}
          </div>
        </div>

        <footer className="border-t border-white/10 py-4 sm:py-6 text-center">
          <p className="text-[10px] sm:text-xs text-gray-400">© 2026 FyndBo.se – En plattform för bostadssökande</p>
        </footer>
      </main>
    </div>
  )
}