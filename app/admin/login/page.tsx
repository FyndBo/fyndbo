'use client'

import {
  Suspense,
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  signIn,
  useSession,
} from 'next-auth/react'

import Image from 'next/image'
import Link from 'next/link'

import {
  useRouter,
  useSearchParams,
} from 'next/navigation'

// ============================================================
// IKONER
// ============================================================

type IconName =
  | 'mail'
  | 'lock'
  | 'google'
  | 'arrow'
  | 'warning'
  | 'eye'
  | 'eyeOff'
  | 'shield'

function Icon({
  name,
  className = 'h-5 w-5',
}: {
  name: IconName
  className?: string
}) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap:
      'round' as const,
    strokeLinejoin:
      'round' as const,
  }

  switch (name) {
    case 'mail':
      return (
        <svg {...common}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <path d="m3 7 9 6 9-6" />
        </svg>
      )

    case 'lock':
      return (
        <svg {...common}>
          <rect
            x="4"
            y="10"
            width="16"
            height="11"
            rx="2"
          />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      )

    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      )

    case 'warning':
      return (
        <svg {...common}>
          <path d="M12 3 2 21h20Z" />
          <path d="M12 9v5M12 18h.01" />
        </svg>
      )

    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle
            cx="12"
            cy="12"
            r="2.5"
          />
        </svg>
      )

    case 'eyeOff':
      return (
        <svg {...common}>
          <path d="m3 3 18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a15 15 0 0 1-2.4 3.5" />
          <path d="M6.6 6.6C3.6 8.6 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 4-.8" />
        </svg>
      )

    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      )

    case 'google':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
          />

          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
          />

          <path
            fill="#FBBC05"
            d="M5.84 14.09A6.5 6.5 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93Z"
          />

          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
          />
        </svg>
      )

    default:
      return null
  }
}

// ============================================================
// LOGIN FORM
// ============================================================

function LoginContent() {
  const router =
    useRouter()

  const searchParams =
    useSearchParams()

  const {
    data: session,
    status,
  } = useSession()

  const [
    email,
    setEmail,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  // ==========================================================
  // CALLBACK URL
  // ==========================================================

  const rawCallbackUrl =
    searchParams.get(
      'callbackUrl'
    )

  const callbackUrl =
    rawCallbackUrl &&
    rawCallbackUrl.startsWith(
      '/'
    )
      ? rawCallbackUrl
      : '/admin'

  // ==========================================================
  // REDIRECT OM REDAN INLOGGAD
  // ==========================================================

  useEffect(() => {
    if (
      status ===
        'authenticated' &&
      session
    ) {
      router.replace(
        callbackUrl
      )
    }
  }, [
    status,
    session,
    router,
    callbackUrl,
  ])

  // ==========================================================
  // CREDENTIALS LOGIN
  // ==========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const normalizedEmail =
      email
        .trim()
        .toLowerCase()

    if (
      !normalizedEmail ||
      !password
    ) {
      setError(
        'Fyll i e-postadress och lösenord.'
      )

      return
    }

    setError('')
    setLoading(true)

    try {
      const result =
        await signIn(
          'credentials',
          {
            email:
              normalizedEmail,

            password,

            redirect:
              false,

            callbackUrl,
          }
        )

      if (
        !result ||
        result.error
      ) {
        setError(
          'Fel e-postadress eller lösenord.'
        )

        return
      }

      router.replace(
        result.url ||
          callbackUrl
      )

      router.refresh()
    } catch (error) {
      console.error(
        'Login error:',
        error
      )

      setError(
        'Det gick inte att logga in just nu.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // GOOGLE
  // ==========================================================

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)

    try {
      await signIn(
        'google',
        {
          callbackUrl,
        }
      )
    } catch (error) {
      console.error(
        'Google login error:',
        error
      )

      setError(
        'Google-inloggningen kunde inte startas.'
      )

      setGoogleLoading(false)
    }
  }

  // ==========================================================
  // SESSION LOADING
  // ==========================================================

  if (
    status ===
    'loading'
  ) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">

        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/10 border-t-blue-500" />

      </div>
    )
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="w-full max-w-md">

      {/* LOGO */}

      <div className="mb-8 text-center">

        <Link
          href="/"
          className="inline-block"
        >
          <Image
            src="/Fyndbo-blue-bkg.png"
            alt="FyndBo"
            width={210}
            height={120}
            priority
            className="mx-auto h-auto w-48 sm:w-52"
          />
        </Link>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-400">
          Administration
        </p>

      </div>

      {/* CARD */}

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-8">

        <div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Logga in
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Logga in för att hantera bostäder, prenumeranter och FyndBos administration.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.06] p-3.5">

            <Icon
              name="warning"
              className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
            />

            <p className="text-xs leading-5 text-red-300">
              {error}
            </p>

          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 space-y-4"
        >

          {/* EMAIL */}

          <div>

            <label
              htmlFor="email"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              E-postadress
            </label>

            <div className="relative">

              <Icon
                name="mail"
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
              />

              <input
                id="email"
                type="email"
                value={
                  email
                }
                onChange={(
                  event
                ) => {
                  setEmail(
                    event.target.value
                  )

                  if (error) {
                    setError('')
                  }
                }}
                placeholder="admin@fyndbo.se"
                autoComplete="email"
                required
                disabled={
                  loading ||
                  googleLoading
                }
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.04] py-3.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50"
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div>

            <label
              htmlFor="password"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              Lösenord
            </label>

            <div className="relative">

              <Icon
                name="lock"
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
              />

              <input
                id="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={
                  password
                }
                onChange={(
                  event
                ) => {
                  setPassword(
                    event.target.value
                  )

                  if (error) {
                    setError('')
                  }
                }}
                placeholder="Ditt lösenord"
                autoComplete="current-password"
                required
                disabled={
                  loading ||
                  googleLoading
                }
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.04] py-3.5 pl-10 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 transition hover:bg-white/[0.05] hover:text-slate-300"
              >
                <Icon
                  name={
                    showPassword
                      ? 'eyeOff'
                      : 'eye'
                  }
                  className="h-4 w-4"
                />
              </button>

            </div>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={
              loading ||
              googleLoading
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                Loggar in...
              </>
            ) : (
              <>
                Logga in

                <Icon
                  name="arrow"
                  className="h-4 w-4"
                />
              </>
            )}

          </button>

        </form>

        {/* DIVIDER */}

        <div className="my-6 flex items-center gap-3">

          <div className="h-px flex-1 bg-white/[0.06]" />

          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-700">
            eller
          </span>

          <div className="h-px flex-1 bg-white/[0.06]" />

        </div>

        {/* GOOGLE */}

        <button
          type="button"
          onClick={
            handleGoogleLogin
          }
          disabled={
            loading ||
            googleLoading
          }
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm font-medium text-slate-300 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >

          {googleLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <Icon
              name="google"
              className="h-5 w-5"
            />
          )}

          {googleLoading
            ? 'Öppnar Google...'
            : 'Fortsätt med Google'}

        </button>

        {/* SECURITY */}

        <div className="mt-6 border-t border-white/[0.06] pt-5">

          <div className="flex items-start gap-2.5">

            <Icon
              name="shield"
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-600"
            />

            <p className="text-[10px] leading-5 text-slate-600">
              Endast godkända administratörer och mäklarkonton kan komma åt FyndBos adminpanel.
            </p>

          </div>

        </div>

      </div>

      {/* BACK */}

      <Link
        href="/"
        className="mx-auto mt-6 flex w-fit items-center gap-2 text-xs text-slate-600 transition hover:text-slate-300"
      >
        Tillbaka till FyndBo
      </Link>

    </div>
  )
}

// ============================================================
// PAGE
// ============================================================

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">

      {/* BACKGROUND */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >

        <div className="absolute left-1/2 top-[-250px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/[0.09] blur-[140px]" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[550px] w-[550px] rounded-full bg-indigo-600/[0.06] blur-[140px]" />

        <div className="absolute left-[-250px] top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-cyan-600/[0.035] blur-[150px]" />

      </div>

      <div className="relative z-10 flex w-full justify-center">

        <Suspense
          fallback={
            <div className="flex h-60 items-center justify-center">

              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/10 border-t-blue-500" />

            </div>
          }
        >
          <LoginContent />
        </Suspense>

      </div>

    </main>
  )
}