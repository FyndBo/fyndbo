'use client'

import {
  Suspense,
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import Image from 'next/image'
import Link from 'next/link'
import {
  useSearchParams,
} from 'next/navigation'

// ============================================================
// ICON
// ============================================================

type IconName =
  | 'mail'
  | 'check'
  | 'warning'
  | 'arrow'
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
    viewBox:
      '0 0 24 24',
    fill:
      'none',
    stroke:
      'currentColor',
    strokeWidth:
      2,
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

    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )

    case 'warning':
      return (
        <svg {...common}>
          <path d="M12 3 2 21h20Z" />
          <path d="M12 9v5M12 18h.01" />
        </svg>
      )

    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      )

    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      )

    default:
      return null
  }
}

// ============================================================
// FORM
// ============================================================

function UnsubscribeContent() {
  const searchParams =
    useSearchParams()

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    status,
    setStatus,
  ] =
    useState<
      | 'idle'
      | 'loading'
      | 'success'
      | 'error'
    >('idle')

  const [
    message,
    setMessage,
  ] =
    useState('')

  // ==========================================================
  // FYLL I E-POST FRÅN URL OM DEN FINNS
  //
  // /avregistrera?email=test@example.com
  // ==========================================================

  useEffect(() => {
    const emailFromUrl =
      searchParams.get(
        'email'
      )

    if (emailFromUrl) {
      setEmail(
        emailFromUrl
      )
    }
  }, [searchParams])

  // ==========================================================
  // SUBMIT
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
      !normalizedEmail
    ) {
      setStatus(
        'error'
      )

      setMessage(
        'Ange din e-postadress.'
      )

      return
    }

    setStatus(
      'loading'
    )

    setMessage('')

    try {
      const response =
        await fetch(
          '/api/avregistrera',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                email:
                  normalizedEmail,
              }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Avregistreringen kunde inte genomföras.'
        )
      }

      setStatus(
        'success'
      )

      setMessage(
        data.message ||
          'Du har avregistrerats från FyndBos nyhetsbrev.'
      )
    } catch (error: any) {
      setStatus(
        'error'
      )

      setMessage(
        error?.message ||
          'Kunde inte ansluta till servern.'
      )
    }
  }

  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (
    status ===
    'success'
  ) {
    return (
      <div className="w-full max-w-md">

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">

            <Icon
              name="check"
              className="h-6 w-6"
            />

          </div>

          <div className="mt-6 text-center">

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Du är avregistrerad
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
              {message}
            </p>

            <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-slate-600">
              Du kan självklart registrera dig igen via FyndBo om du ändrar dig senare.
            </p>

          </div>

          <Link
            href="/"
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Till FyndBo

            <Icon
              name="arrow"
              className="h-4 w-4"
            />
          </Link>

        </div>

      </div>
    )
  }

  // ==========================================================
  // FORM UI
  // ==========================================================

  return (
    <div className="w-full max-w-md">

      <div className="mb-7 text-center">

        <Link
          href="/"
          className="inline-block"
        >
          <Image
            src="/Fyndbo-blue-bkg.png"
            alt="FyndBo"
            width={190}
            height={100}
            priority
            className="mx-auto h-auto w-44 sm:w-48"
          />
        </Link>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-400">
          Nyhetsbrev
        </p>

      </div>

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">

        <div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Avregistrera nyhetsbrev
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Vill du inte längre få nyheter och uppdateringar från FyndBo kan du avsluta prenumerationen här.
          </p>

        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-7 space-y-5"
        >

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

                  if (
                    status ===
                    'error'
                  ) {
                    setStatus(
                      'idle'
                    )

                    setMessage('')
                  }
                }}
                placeholder="din@email.se"
                required
                disabled={
                  status ===
                  'loading'
                }
                autoComplete="email"
                className="w-full rounded-xl border border-white/[0.09] bg-white/[0.045] py-3.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50"
              />

            </div>

          </div>

          {status ===
            'error' && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.06] p-3.5">

              <Icon
                name="warning"
                className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
              />

              <p className="text-xs leading-5 text-red-300">
                {message}
              </p>

            </div>
          )}

          <button
            type="submit"
            disabled={
              status ===
              'loading'
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {status ===
            'loading' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                Avregistrerar...
              </>
            ) : (
              'Avregistrera'
            )}

          </button>

        </form>

        <div className="mt-6 border-t border-white/[0.06] pt-5">

          <div className="flex items-start gap-2.5">

            <Icon
              name="shield"
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-600"
            />

            <p className="text-[10px] leading-5 text-slate-600">
              Adressen tas bort från FyndBos prenumerationssystem och ska inte längre få våra nyhetsbrev.
            </p>

          </div>

        </div>

      </div>

      <p className="mt-6 text-center text-[10px] text-slate-700">
        FyndBo.se
      </p>

    </div>
  )
}

// ============================================================
// PAGE
// ============================================================

export default function AvregistreraPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/[0.08] blur-[120px]" />

        <div className="absolute bottom-[-220px] right-[-100px] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.06] blur-[130px]" />
      </div>

      <div className="relative z-10 flex w-full justify-center">

        <Suspense
          fallback={
            <div className="flex h-48 items-center justify-center">

              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/10 border-t-blue-500" />

            </div>
          }
        >
          <UnsubscribeContent />
        </Suspense>

      </div>

    </main>
  )
}