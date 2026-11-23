'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const [errorMsg, setErrorMsg] = useState('')

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // ============================================================
  // NEDRÄKNING
  // 31 januari 2027 kl. 10:00 svensk tid
  // ============================================================

  useEffect(() => {
    const launchDate = new Date('2027-01-31T10:00:00+01:00')

    const updateCountdown = () => {
      const now = new Date()
      const diff = launchDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        })

        return false
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (diff % (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        ),
        minutes: Math.floor(
          (diff % (1000 * 60 * 60)) /
            (1000 * 60)
        ),
        seconds: Math.floor(
          (diff % (1000 * 60)) /
            1000
        ),
      })

      return true
    }

    // Kör direkt så sidan inte visar 0 först
    updateCountdown()

    const timer = setInterval(() => {
      const running = updateCountdown()

      if (!running) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // ============================================================
  // SPARA E-POST
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    const cleanEmail = email.trim()

    if (
      !cleanEmail ||
      !cleanEmail.includes('@') ||
      !cleanEmail.includes('.')
    ) {
      setStatus('error')
      setErrorMsg('Ange en giltig e-postadress')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/save-email', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email: cleanEmail,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
        setErrorMsg(
          data.error || 'Något gick fel'
        )
      }
    } catch {
      setStatus('error')
      setErrorMsg(
        'Kunde inte spara e-post. Försök igen.'
      )
    }
  }

  // ============================================================
  // INPUT
  // ============================================================

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmail(e.target.value)

    if (
      status === 'error' ||
      status === 'success'
    ) {
      setStatus('idle')
      setErrorMsg('')
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* ========================================================
          BAKGRUND
      ======================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="
          absolute
          left-10
          top-10
          h-72
          w-72
          rounded-full
          bg-blue-500/10
          blur-3xl
          animate-pulse
        " />

        <div className="
          absolute
          bottom-10
          right-10
          h-80
          w-80
          rounded-full
          bg-purple-500/10
          blur-3xl
          animate-pulse
        " />

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(45deg,#ffffff03_1px,transparent_1px)]
            bg-[size:50px_50px]
          "
        />

      </div>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="
        relative
        z-10
        mx-auto
        max-w-7xl
        px-4
        py-4
        sm:px-6
        sm:py-6
      ">

        {/* ======================================================
            LOGGA
        ====================================================== */}

        <div className="
          flex
          justify-center
          pb-3
          pt-2
          sm:pb-6
          sm:pt-4
        ">

          <img
            src="/Fyndbo-blue-bkg.png"
            alt="FyndBo.se"
            className="
              h-40
              w-auto
              drop-shadow-xl
              transition-transform
              duration-500

              hover:scale-105

              sm:h-48
              md:h-56
              lg:h-64
              xl:h-72
              2xl:h-80
            "
          />

        </div>

        {/* ======================================================
            HERO
        ====================================================== */}

        <div className="
          mx-auto
          mb-6
          max-w-3xl
          text-center
          sm:mb-10
        ">

          <div className="
            mb-3
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/20
            bg-white/10
            px-3
            py-1.5
            backdrop-blur-sm
            sm:mb-4
            sm:px-4
          ">

            <span className="relative flex h-1.5 w-1.5">

              <span className="
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                bg-emerald-400
                opacity-75
              " />

              <span className="
                relative
                inline-flex
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-500
              " />

            </span>

            <span className="
              text-[10px]
              tracking-wide
              text-gray-300
              sm:text-xs
            ">
              Lanseras 31 januari 2027
            </span>

          </div>

          <h1 className="
            mb-3
            text-3xl
            font-bold
            leading-[1.1]
            tracking-tight
            text-white

            sm:mb-4
            sm:text-5xl

            md:text-6xl
            lg:text-7xl
          ">

            Hitta ditt

            <span className="
              block
              bg-gradient-to-r
              from-blue-300
              via-indigo-300
              to-purple-300
              bg-clip-text
              text-transparent
            ">
              nästa hem
            </span>

          </h1>

          <p className="
            mx-auto
            max-w-2xl
            px-2
            text-sm
            leading-relaxed
            text-gray-300

            sm:text-base
            md:text-lg
          ">
            Alla bostadsannonser samlade på ett ställe.
            Sök, jämför och hitta drömhemmet.
          </p>

        </div>

        {/* ======================================================
            NEDRÄKNING
        ====================================================== */}

        <div className="
          mx-auto
          mb-8
          max-w-2xl
          sm:mb-10
        ">

          <div className="
            rounded-2xl
            border
            border-white/20
            bg-white/10
            p-4
            text-center
            shadow-2xl
            backdrop-blur-sm

            sm:p-6
            md:rounded-3xl
            md:p-10
          ">

            <p className="
              mb-4
              text-[10px]
              uppercase
              tracking-wider
              text-gray-300

              sm:text-xs
              md:mb-6
              md:text-sm
            ">
              Nedräkning till lansering
            </p>

            <div className="
              grid
              grid-cols-4
              gap-2
              sm:gap-4
              md:gap-6
            ">

              {/* DAGAR */}

              <div className="text-center">

                <div className="
                  rounded-xl
                  bg-white/10
                  px-1
                  py-2
                  font-mono
                  text-xl
                  font-bold
                  text-white
                  shadow-inner

                  sm:rounded-2xl
                  sm:px-3
                  sm:text-3xl

                  md:py-3
                  md:text-4xl

                  lg:text-5xl
                ">
                  {timeLeft.days}
                </div>

                <p className="
                  mt-1
                  text-[8px]
                  text-gray-400

                  sm:mt-2
                  sm:text-[10px]

                  md:text-xs
                ">
                  DAGAR
                </p>

              </div>

              {/* TIMMAR */}

              <div className="text-center">

                <div className="
                  rounded-xl
                  bg-white/10
                  px-1
                  py-2
                  font-mono
                  text-xl
                  font-bold
                  text-white
                  shadow-inner

                  sm:rounded-2xl
                  sm:px-3
                  sm:text-3xl

                  md:py-3
                  md:text-4xl

                  lg:text-5xl
                ">
                  {timeLeft.hours
                    .toString()
                    .padStart(2, '0')}
                </div>

                <p className="
                  mt-1
                  text-[8px]
                  text-gray-400

                  sm:mt-2
                  sm:text-[10px]

                  md:text-xs
                ">
                  TIMMAR
                </p>

              </div>

              {/* MINUTER */}

              <div className="text-center">

                <div className="
                  rounded-xl
                  bg-white/10
                  px-1
                  py-2
                  font-mono
                  text-xl
                  font-bold
                  text-white
                  shadow-inner

                  sm:rounded-2xl
                  sm:px-3
                  sm:text-3xl

                  md:py-3
                  md:text-4xl

                  lg:text-5xl
                ">
                  {timeLeft.minutes
                    .toString()
                    .padStart(2, '0')}
                </div>

                <p className="
                  mt-1
                  text-[8px]
                  text-gray-400

                  sm:mt-2
                  sm:text-[10px]

                  md:text-xs
                ">
                  MINUTER
                </p>

              </div>

              {/* SEKUNDER */}

              <div className="text-center">

                <div className="
                  rounded-xl
                  bg-white/10
                  px-1
                  py-2
                  font-mono
                  text-xl
                  font-bold
                  text-white
                  shadow-inner

                  sm:rounded-2xl
                  sm:px-3
                  sm:text-3xl

                  md:py-3
                  md:text-4xl

                  lg:text-5xl
                ">
                  {timeLeft.seconds
                    .toString()
                    .padStart(2, '0')}
                </div>

                <p className="
                  mt-1
                  text-[8px]
                  text-gray-400

                  sm:mt-2
                  sm:text-[10px]

                  md:text-xs
                ">
                  SEKUNDER
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            OM FYNDBO
        ====================================================== */}

        <div className="
          mb-8
          text-center
          sm:mb-10
        ">

          <Link
            href="/om"
            className="
              group
              inline-flex
              items-center
              gap-2

              rounded-full

              bg-gradient-to-r
              from-blue-500
              to-indigo-500

              px-5
              py-2.5

              text-sm
              font-medium
              text-white

              shadow-md

              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:from-blue-600
              hover:to-indigo-600
              hover:shadow-lg

              sm:px-6
              sm:py-3
              sm:text-base
            "
          >

            <span>
              Upptäck historien bakom FyndBo
            </span>

            <svg
              className="
                h-3
                w-3
                transition-transform
                group-hover:translate-x-1

                sm:h-4
                sm:w-4
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />

            </svg>

          </Link>

        </div>


        {/* ======================================================
            FRAMTIDENS BOSTADSVISNING
        ====================================================== */}

        <section className="
          mx-auto
          mb-10
          max-w-5xl
          overflow-hidden
          rounded-2xl
          border
          border-blue-400/20
          bg-gradient-to-br
          from-blue-500/10
          via-white/5
          to-indigo-500/10
          p-5
          shadow-xl
          backdrop-blur-sm
          sm:mb-14
          sm:p-7
        ">
          <div className="
            grid
            items-center
            gap-6
            md:grid-cols-[1fr_0.9fr]
            md:gap-8
          ">
            <div>
              <span className="
                mb-3
                inline-flex
                items-center
                rounded-full
                border
                border-blue-300/20
                bg-blue-400/10
                px-3
                py-1
                text-[10px]
                font-medium
                uppercase
                tracking-wider
                text-blue-200
                sm:text-xs
              ">
                Framtidens bostadsvisning
              </span>

              <h2 className="
                mb-3
                text-2xl
                font-bold
                tracking-tight
                text-white
                sm:text-3xl
              ">
                Upptäck bostaden i 3D
              </h2>

              <p className="
                max-w-xl
                text-sm
                leading-relaxed
                text-gray-300
                sm:text-base
              ">
                Tänk dig att kunna utforska ett hus direkt på skärmen.
                Med interaktiva 3D-modeller och smart AI vill vi göra
                det enklare att få en känsla för bostadens rum,
                planlösning och möjligheter – redan innan visningen.
              </p>

              <p className="
                mt-3
                text-xs
                text-blue-200/80
                sm:text-sm
              ">
                En vision vi vill utveckla vidare på FyndBo.
              </p>
            </div>

            <div className="
              relative
              mx-auto
              flex
              min-h-48
              w-full
              max-w-sm
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-slate-950/30
              p-4
              sm:min-h-56
            ">
              <div className="
                absolute
                inset-0
                bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.16),transparent_70%)]
              " />

              <svg
                viewBox="0 0 320 210"
                role="img"
                aria-label="Illustration av ett hus i en förenklad 3D-vy"
                className="relative z-10 w-full max-w-[290px] drop-shadow-2xl"
                fill="none"
              >
                <path d="M45 91 153 32l122 61-108 64L45 91Z" fill="#334155" stroke="#93C5FD" strokeWidth="2" />
                <path d="m45 91 122 66v39L45 126V91Z" fill="#1E3A5F" stroke="#60A5FA" strokeWidth="2" />
                <path d="m167 157 108-64v39l-108 64v-39Z" fill="#1D4ED8" stroke="#93C5FD" strokeWidth="2" />
                <path d="m75 86 78-43 85 43-77 46-86-46Z" fill="#64748B" stroke="#BFDBFE" strokeWidth="2" />
                <path d="m75 86 86 46v-25L75 64v22Z" fill="#475569" />
                <path d="m161 132 77-46V64l-77 43v25Z" fill="#3B82F6" />
                <path d="m75 64 78-43 85 43-77 43-86-43Z" fill="#94A3B8" stroke="#DBEAFE" strokeWidth="2" />
                <path d="m110 104 29 16v-31l-29-16v31Z" fill="#BFDBFE" stroke="#E0F2FE" strokeWidth="1.5" />
                <path d="m188 105 27-16V61l-27 15v29Z" fill="#BAE6FD" stroke="#E0F2FE" strokeWidth="1.5" />
                <path d="m151 151 25 13v-35l-25-13v35Z" fill="#0F172A" stroke="#93C5FD" strokeWidth="1.5" />
                <path d="m151 151 25 13" stroke="#93C5FD" strokeWidth="1.5" />
                <path d="m163 157 12 7" stroke="#93C5FD" strokeWidth="1.5" />
                <path d="m35 185 132 20 122-72" stroke="#60A5FA" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="4 5" />
              </svg>

              <span className="
                absolute
                bottom-3
                right-3
                rounded-full
                border
                border-white/10
                bg-slate-900/80
                px-2.5
                py-1
                text-[10px]
                text-blue-200
              ">
                3D-koncept
              </span>
            </div>
          </div>
        </section>

        {/* ======================================================
            WAITLIST
        ====================================================== */}

        <div className="
          mx-auto
          mb-10
          max-w-md
          sm:mb-16
        ">

          <div className="
            rounded-2xl
            border
            border-white/20
            bg-white/10
            p-5
            text-center
            backdrop-blur-sm

            sm:p-8
          ">

            <h3 className="
              mb-1
              text-base
              font-semibold
              text-white

              sm:text-lg
            ">
              Bli först att få veta
            </h3>

            <p className="
              mb-4
              text-xs
              text-gray-300

              sm:mb-6
              sm:text-sm
            ">
              VIP-inbjudan skickas direkt vid lansering
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
            >

              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="din@epost.se"
                autoComplete="email"
                disabled={status === 'loading'}
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/20
                  bg-white/10

                  px-3
                  py-2.5

                  text-sm
                  text-white

                  transition

                  placeholder:text-white/50

                  focus:border-transparent
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:px-4
                  sm:py-3
                  sm:text-base
                "
              />

              <button
                type="submit"
                disabled={
                  status === 'loading' ||
                  email.trim().length === 0
                }
                className="
                  w-full
                  rounded-xl

                  bg-gradient-to-r
                  from-blue-500
                  to-indigo-500

                  py-2.5

                  text-sm
                  font-medium
                  text-white

                  shadow-md

                  transition-all
                  duration-300

                  hover:from-blue-600
                  hover:to-indigo-600

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:py-3
                  sm:text-base
                "
              >

                {status === 'loading'
                  ? 'Sparar...'
                  : 'Intresseanmälan →'}

              </button>

            </form>

            {/* SUCCESS */}

            {status === 'success' && (
              <p className="
                mt-3
                text-xs
                text-emerald-300
                sm:mt-4
                sm:text-sm
              ">
                ✓ Tack! Vi återkommer vid lansering.
              </p>
            )}

            {/* ERROR */}

            {status === 'error' &&
              errorMsg && (
                <p className="
                  mt-3
                  text-xs
                  text-rose-300
                  sm:mt-4
                  sm:text-sm
                ">
                  ✕ {errorMsg}
                </p>
              )}

          </div>

        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="
          border-t
          border-white/10
          py-4
          text-center
          sm:py-6
        ">

          <p className="
            text-[10px]
            text-gray-400
            sm:text-xs
          ">
            © 2026 FyndBo.se – En plattform för bostadssökande
          </p>

        </footer>

      </main>

    </div>
  )
}