'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

// SVG-ikoner
const Icons = {
  logo: () => (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  mail: () => (
    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" fill="none"/>
      <path d="M2 8l10 7 10-7" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  lock: () => (
    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="10" width="18" height="12" rx="2" stroke="currentColor" fill="none"/>
      <path d="M7 10V7a5 5 0 0110 0v3" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  arrowRight: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <polyline points="12 5 19 12 12 19" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  shield: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" fill="none"/>
    </svg>
  ),
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const getErrorMessage = () => {
    switch (errorParam) {
      case 'unauthorized': return 'Du har inte behörighet att komma åt denna sida.'
      case 'CredentialsSignin': return 'Fel e-post eller lösenord. Försök igen.'
      case 'OAuthSignin': return 'Google-inloggningen misslyckades. Försök igen.'
      case 'OAuthCallback': return 'Ditt Google-konto har inte admin-behörighet.'
      case 'OAuthAccountNotLinked': return 'Detta konto är redan kopplat till en annan inloggningsmetod.'
      case 'SessionRequired': return 'Du måste vara inloggad för att se denna sida.'
      default: return ''
    }
  }

  const displayError = error || getErrorMessage()

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Fel e-post eller lösenord. Försök igen.')
        setLoading(false)
        return
      }

      if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError('Ett oväntat fel inträffade. Försök igen.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoadingGoogle(true)
    
    try {
      await signIn('google', { 
        callbackUrl,
        redirect: true 
      })
    } catch (err) {
      setError('Google-inloggningen misslyckades.')
      setLoadingGoogle(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center px-4 py-12">
      {/* Bakgrundsdekoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logotyp och rubrik */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <span className="text-white"><Icons.logo /></span>
          </div>
          <h1 className="text-2xl font-bold text-white">FyndBo.se</h1>
          <p className="text-slate-400 text-sm mt-1">Logga in till adminpanelen</p>
        </div>

        {/* Inloggningskort */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl">
          {/* Felmeddelande */}
          {displayError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-red-300 text-sm">{displayError}</p>
              </div>
            </div>
          )}

          {/* Google-inloggning */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || loadingGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium px-6 py-3 rounded-xl transition-all mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icons.google />
            {loadingGoogle ? 'Ansluter till Google...' : 'Logga in med Google'}
          </button>

          {/* Separator */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-slate-500 text-xs uppercase tracking-wider">eller</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Email/lösenord */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-slate-400 mb-1.5">E-postadress</label>
              <div className="relative">
                <Icons.mail />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fyndbo.se"
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm text-slate-400 mb-1.5">Lösenord</label>
              <div className="relative">
                <Icons.lock />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || loadingGoogle}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
                  </svg>
                  Loggar in...
                </>
              ) : (
                <>
                  Logga in
                  <Icons.arrowRight />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer-text */}
        <p className="text-center text-slate-500 text-xs mt-6 flex items-center justify-center gap-1.5">
          <Icons.shield />
          Endast för auktoriserade administratörer
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
          </svg>
          <p className="text-white text-lg">Laddar inloggning...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}