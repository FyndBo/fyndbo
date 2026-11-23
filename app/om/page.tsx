import Link from 'next/link'
import Image from 'next/image'

// ============================================================
// IKONER
// ============================================================

function CostIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path
        d="M12 6v4M12 16v2"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="14"
        r="2"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="12"
        cy="12"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

function TechIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="1"
      />

      <path
        d="M8 10h8M8 14h4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LightbulbIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M9 18h6M10 21h4"
        strokeLinecap="round"
      />

      <path d="M12 3a7 7 0 0 0-7 7c0 2.8 1.5 4.5 2 5.5V17h10v-1.5c.5-1 2-2.7 2-5.5a7 7 0 0 0-7-7z" />

      <path
        d="M12 8v4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M5 13l4 4L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M15 5l-7 7 7 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M10 11H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6c0 2-1 3-3 3"
        strokeLinecap="round"
      />

      <path
        d="M20 11h-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6c0 2-1 3-3 3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ============================================================
// FÖRDELAR
// ============================================================

const benefits = [
  {
    title: 'Transparent prissättning',
    description: 'Tydligt från början',
  },
  {
    title: 'Användaren i fokus',
    description: 'Byggt för bostadssökande',
  },
  {
    title: 'Modern sökning',
    description: 'Hitta rätt snabbare',
  },
  {
    title: 'Annonser samlade',
    description: 'En plats för bostadssökandet',
  },
]

// ============================================================
// OM FYNDBO
// ============================================================

export default function OmSida() {
  return (
    <div className="
      relative
      min-h-screen
      overflow-hidden
      bg-gradient-to-br
      from-slate-900
      via-slate-800
      to-slate-900
    ">

      {/* ========================================================
          BAKGRUND
      ======================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
        "
        aria-hidden="true"
      >

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
          motion-reduce:animate-none
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
          motion-reduce:animate-none
        " />

        <div className="
          absolute
          inset-0
          bg-[linear-gradient(45deg,#ffffff03_1px,transparent_1px)]
          bg-[size:50px_50px]
        " />

      </div>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="
        relative
        z-10
        mx-auto
        max-w-5xl
        px-4
        py-6

        sm:px-6
        sm:py-8
      ">

        {/* ======================================================
            LOGGA
        ====================================================== */}

        <div className="
          mb-5
          text-center
          sm:mb-6
        ">

          <Link
            href="/"
            aria-label="Gå till FyndBo startsida"
            className="inline-block"
          >

            <Image
              src="/Fyndbo-blue-bkg.png"
              alt="FyndBo.se"
              width={800}
              height={400}
              priority
              sizes="
                (max-width: 640px) 320px,
                (max-width: 1024px) 420px,
                520px
              "
              className="
                mx-auto
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
              "
            />

          </Link>

        </div>

        {/* ======================================================
            HUVUDKORT
        ====================================================== */}

        <div className="
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-5
          shadow-2xl
          backdrop-blur-sm

          sm:p-8
          md:p-10
        ">

          {/* ====================================================
              HEADER
          ==================================================== */}

          <header className="
            mb-8
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
              px-4
              py-1.5
            ">

              <span className="
                h-1.5
                w-1.5
                rounded-full
                bg-blue-400
              " />

              <span className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-gray-300

                sm:text-xs
              ">
                Varför FyndBo
              </span>

            </div>

            <h1 className="
              mx-auto
              mb-4
              max-w-4xl
              text-3xl
              font-bold
              leading-tight
              tracking-tight
              text-white

              sm:text-4xl
              md:text-5xl
              lg:text-6xl
            ">
              Vi bygger en enklare väg till
              <span className="
                block
                bg-gradient-to-r
                from-blue-300
                via-indigo-300
                to-purple-300
                bg-clip-text
                text-transparent
              ">
                ditt nästa hem
              </span>
            </h1>

            <p className="
              mx-auto
              max-w-2xl
              text-sm
              leading-relaxed
              text-gray-300

              sm:text-base
              md:text-lg
            ">
              Bostadssökandet ska vara enkelt, transparent och
              modernt. FyndBo.se byggs för att samla information,
              förbättra sökningen och göra det lättare att hitta
              bostaden som faktiskt passar dig.
            </p>

          </header>

          {/* ====================================================
              VARFÖR MARKNADEN KAN BLI BÄTTRE
          ==================================================== */}

          <div className="space-y-4">

            {/* KOSTNADER */}

            <section className="
              group
              rounded-xl
              border
              border-white/5
              border-l-4
              border-l-rose-500
              bg-gradient-to-r
              from-rose-500/10
              to-transparent
              p-5

              transition-all
              duration-300

              hover:border-white/10
              hover:bg-rose-500/[0.12]
            ">

              <div className="
                mb-2
                flex
                items-center
                gap-3
              ">

                <div className="
                  text-rose-400
                  transition-transform
                  duration-300
                  group-hover:scale-110
                ">
                  <CostIcon />
                </div>

                <h2 className="
                  text-lg
                  font-semibold
                  text-white

                  sm:text-xl
                ">
                  Höga kostnader
                </h2>

              </div>

              <p className="
                pl-9
                text-sm
                leading-relaxed
                text-gray-300

                sm:text-base
              ">
                Att marknadsföra en bostad kan innebära stora
                kostnader. Vi tror på en modell där prissättningen
                är tydlig och där värdet för både bostadssäljare,
                mäklare och bostadssökande står i centrum.
              </p>

            </section>

            {/* INCITAMENT */}

            <section className="
              group
              rounded-xl
              border
              border-white/5
              border-l-4
              border-l-amber-500
              bg-gradient-to-r
              from-amber-500/10
              to-transparent
              p-5

              transition-all
              duration-300

              hover:border-white/10
              hover:bg-amber-500/[0.12]
            ">

              <div className="
                mb-2
                flex
                items-center
                gap-3
              ">

                <div className="
                  text-amber-400
                  transition-transform
                  duration-300
                  group-hover:scale-110
                ">
                  <TargetIcon />
                </div>

                <h2 className="
                  text-lg
                  font-semibold
                  text-white

                  sm:text-xl
                ">
                  Användaren ska komma först
                </h2>

              </div>

              <p className="
                pl-9
                text-sm
                leading-relaxed
                text-gray-300

                sm:text-base
              ">
                En bostadsplattform ska hjälpa människor att fatta
                bättre beslut. Därför vill vi bygga funktioner som
                utgår från vad bostadssökaren faktiskt behöver –
                inte bara från hur många annonser som kan visas.
              </p>

            </section>

            {/* TEKNIK */}

            <section className="
              group
              rounded-xl
              border
              border-white/5
              border-l-4
              border-l-slate-400
              bg-gradient-to-r
              from-slate-500/10
              to-transparent
              p-5

              transition-all
              duration-300

              hover:border-white/10
              hover:bg-slate-500/[0.12]
            ">

              <div className="
                mb-2
                flex
                items-center
                gap-3
              ">

                <div className="
                  text-slate-300
                  transition-transform
                  duration-300
                  group-hover:scale-110
                ">
                  <TechIcon />
                </div>

                <h2 className="
                  text-lg
                  font-semibold
                  text-white

                  sm:text-xl
                ">
                  Tekniken kan göra mer
                </h2>

              </div>

              <p className="
                pl-9
                text-sm
                leading-relaxed
                text-gray-300

                sm:text-base
              ">
                Kartor, filtrering, sökning och jämförelser kan
                göras både snabbare och smartare. FyndBo byggs
                från grunden med modern teknik och fokus på en
                smidig upplevelse på både mobil och dator.
              </p>

            </section>

          </div>

          {/* ====================================================
              LÖSNING
          ==================================================== */}

          <section className="
            mt-6
            rounded-2xl
            border
            border-blue-500/20
            bg-gradient-to-br
            from-blue-500/15
            via-indigo-500/10
            to-purple-500/10
            p-5

            sm:p-6
            md:p-8
          ">

            <div className="
              mb-3
              flex
              items-center
              gap-3
            ">

              <div className="text-blue-400">
                <LightbulbIcon />
              </div>

              <h2 className="
                text-lg
                font-semibold
                text-white

                sm:text-xl
                md:text-2xl
              ">
                Därför bygger vi FyndBo.se
              </h2>

            </div>

            <p className="
              mb-6
              max-w-3xl
              pl-9
              text-sm
              leading-relaxed
              text-gray-200

              sm:text-base
            ">
              Vår ambition är att skapa en modern svensk
              bostadsplattform där det är enklare att söka,
              jämföra och upptäcka bostäder – med tydligare
              information och en upplevelse byggd för nästa
              generation bostadssökande.
            </p>

            <div className="
              grid
              grid-cols-1
              gap-3

              sm:grid-cols-2
              lg:grid-cols-4
            ">

              {benefits.map((item) => (
                <div
                  key={item.title}
                  className="
                    group
                    rounded-xl
                    border
                    border-white/5
                    bg-white/5
                    p-4
                    text-center

                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:border-blue-400/20
                    hover:bg-white/10
                  "
                >

                  <div className="
                    mb-3
                    flex
                    justify-center
                  ">

                    <div className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-emerald-500/10
                      text-emerald-400

                      transition-transform
                      duration-300

                      group-hover:scale-110
                    ">
                      <CheckIcon />
                    </div>

                  </div>

                  <p className="
                    text-sm
                    font-semibold
                    text-white
                  ">
                    {item.title}
                  </p>

                  <p className="
                    mt-1
                    text-xs
                    text-gray-400
                  ">
                    {item.description}
                  </p>

                </div>
              ))}

            </div>

          </section>

          {/* ====================================================
              AI OCH INTERAKTIVA 3D-MODELLER
          ==================================================== */}

          <section
            aria-labelledby="ai-3d-heading"
            className="
              mt-8
              overflow-hidden
              rounded-2xl
              border
              border-cyan-400/20
              bg-gradient-to-br
              from-cyan-500/10
              via-blue-500/10
              to-indigo-500/10
              p-5
              sm:p-6
              md:p-8
            "
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" strokeLinejoin="round" />
                  <path d="m4.5 7.5 7.5 4.3 7.5-4.3M12 12v9M8 5.2l8 4.6" strokeLinejoin="round" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                  Framtidens bostadsvisning
                </p>
                <h2
                  id="ai-3d-heading"
                  className="text-lg font-semibold text-white sm:text-xl md:text-2xl"
                >
                  Utforska bostaden med AI och 3D-modeller
                </h2>
              </div>
            </div>

            <p className="mb-6 max-w-3xl pl-0 text-sm leading-relaxed text-gray-200 sm:text-base sm:pl-14">
              Tänk dig att kunna kliva in i ett hus redan innan visningen. Med interaktiva 3D-modeller ska du enkelt kunna se dig omkring online, upptäcka rummens utformning och få en bättre känsla för bostaden – direkt från mobilen eller datorn. AI kan dessutom hjälpa till att göra bostadssökandet smartare och mer personligt.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-slate-950/20 p-4">
                <div className="mb-2 text-cyan-300">
                  <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 10.5 12 3l9 7.5V21H3V10.5Z" strokeLinejoin="round" />
                    <path d="M9 21v-7h6v7M7 10h.01M17 10h.01" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">Se dig omkring i 3D</h3>
                <p className="text-xs leading-relaxed text-gray-400">Utforska bostadens rum och planlösning i en interaktiv digital visning.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/20 p-4">
                <div className="mb-2 text-cyan-300">
                  <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12m8.48 8.48 2.12 2.12m0-12.72-2.12 2.12m-8.48 8.48-2.12 2.12" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">Smartare med AI</h3>
                <p className="text-xs leading-relaxed text-gray-400">Få hjälp att upptäcka bostäder och funktioner som passar dina önskemål.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/20 p-4">
                <div className="mb-2 text-cyan-300">
                  <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="4" width="18" height="13" rx="2" />
                    <path d="M8 21h8M12 17v4M7 9h4m-4 4h7" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">Visning online</h3>
                <p className="text-xs leading-relaxed text-gray-400">Få en tydligare bild av hemmet när det passar dig – på mobil eller dator.</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-cyan-100/70">
              Detta är en vision för hur FyndBo kan utvecklas framöver.
            </p>
          </section>

          {/* ====================================================
              VISION
          ==================================================== */}

          <figure className="
            pt-10
            text-center
          ">

            <div className="
              mb-3
              flex
              justify-center
            ">

              <div className="
                text-gray-400
                opacity-50
              ">
                <QuoteIcon />
              </div>

            </div>

            <blockquote className="
              mx-auto
              max-w-2xl
              text-base
              italic
              leading-relaxed
              text-gray-200

              sm:text-lg
              md:text-xl
            ">
              <p>
                “En bättre väg till ditt nästa hem –
                enklare, tydligare och byggd för dig.”
              </p>
            </blockquote>

            <figcaption className="
              mt-4
              text-sm
              font-medium
              text-blue-400

              sm:text-base
            ">
              Teamet bakom{' '}
              <cite className="not-italic">
                FyndBo.se
              </cite>
            </figcaption>

          </figure>

          {/* ====================================================
              TILLBAKA
          ==================================================== */}

          <div className="
            mt-10
            text-center
          ">

            <Link
              href="/"
              aria-label="Gå tillbaka till startsidan"
              className="
                group
                inline-flex
                items-center
                gap-2

                rounded-full

                bg-gradient-to-r
                from-blue-600
                to-indigo-600

                px-6
                py-2.5

                text-sm
                font-medium
                text-white

                shadow-md
                shadow-blue-500/10

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:from-blue-700
                hover:to-indigo-700
                hover:shadow-xl
                hover:shadow-blue-500/20

                focus:outline-none
                focus:ring-2
                focus:ring-blue-400
                focus:ring-offset-2
                focus:ring-offset-slate-900

                sm:px-8
                sm:py-3
                sm:text-base
              "
            >

              <span className="
                transition-transform
                duration-300
                group-hover:-translate-x-1
              ">
                <ArrowLeftIcon />
              </span>

              <span>
                Tillbaka till startsidan
              </span>

            </Link>

          </div>

        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="
          mt-8
          border-t
          border-white/10
          pt-6
          text-center

          sm:mt-10
        ">

          <p className="
            text-xs
            text-gray-400

            sm:text-sm
          ">
            © 2026 FyndBo.se – En plattform för bostadssökande
          </p>

        </footer>

      </main>

    </div>
  )
}