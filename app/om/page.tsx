'use client'
import Link from 'next/link'
import Image from 'next/image'

// ✅ Ikoner utanför komponenten - skapas bara en gång
function CostIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v4M12 16v2" strokeLinecap="round" />
      <circle cx="12" cy="14" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TechIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="6" width="16" height="12" rx="1" />
      <path d="M8 10h8M8 14h4" strokeLinecap="round" />
    </svg>
  )
}

function LightbulbIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 18h6M10 21h4" strokeLinecap="round" />
      <path d="M12 3a7 7 0 0 0-7 7c0 2.8 1.5 4.5 2 5.5V17h10v-1.5c.5-1 2-2.7 2-5.5a7 7 0 0 0-7-7z" />
      <path d="M12 8v4" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg aria-hidden="true" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 11H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6c0 2-1 3-3 3" strokeLinecap="round" />
      <path d="M20 11h-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6c0 2-1 3-3 3" strokeLinecap="round" />
    </svg>
  )
}

export default function OmSida() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Bakgrundsdekorationer */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse motion-reduce:animate-none delay-1000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Logga */}
        <div className="text-center mb-5 sm:mb-6">
          <Image 
            src="/Fyndbo-blue-bkg.png" 
            alt="FyndBo.se - Sveriges modernaste bostadsplattform" 
            width={800}
            height={400}
            className="h-64 sm:h-56 md:h-64 lg:h-72 xl:h-80 2xl:h-96 w-auto hover:scale-105 transition-transform duration-500 mx-auto drop-shadow-xl"
            priority
            sizes="(max-width: 640px) 100vw, 75vw"
          />
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-6 sm:p-8 md:p-10">
          {/* Header */}
          <header className="text-center mb-8 sm:mb-10">
            <div className="inline-block mb-2 sm:mb-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
              <p className="text-xs sm:text-sm text-gray-300 tracking-wider uppercase">✦ Varför FyndBo ✦</p>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4">
              En bostadsmarknad som fungerar för alla
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
              Vi har analyserat dagens system och identifierat flera grundläggande brister. 
              FyndBo.se är vårt svar – en plattform byggd på transparens, rättvisa och modern teknik.
            </p>
          </header>

          {/* Problem-sektioner */}
          <div className="space-y-4">
            <section className="bg-gradient-to-r from-rose-500/10 to-transparent rounded-xl p-5 border-l-4 border-rose-500 group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-rose-400 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <CostIcon />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Orimliga kostnader</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-300 pl-9">
                Priserna för att synas på de stora plattformarna har skjutit i höjden. 
                Det som en gång var en rimlig avgift har blivit en rejäl tröskel för många.
              </p>
            </section>

            <section className="bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl p-5 border-l-4 border-amber-500 group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-amber-400 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <TargetIcon />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Fel incitament</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-300 pl-9">
                Dagens modell premierar volym och höga priser framför verklig kundnytta. 
                Det är inte den som skapar mest värde som vinner.
              </p>
            </section>

            <section className="bg-gradient-to-r from-gray-500/10 to-transparent rounded-xl p-5 border-l-4 border-gray-500 group hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-gray-400 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <TechIcon />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Gammal teknik</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-300 pl-9">
                Trots miljardvärden har den tekniska utvecklingen stått stilla i åratal. 
                Sökfunktioner, kartor och filtrering fungerar undermåligt.
              </p>
            </section>
          </div>

          {/* Lösnings-sektion */}
          <section className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-5 sm:p-6 border-l-4 border-blue-500 mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-blue-400" aria-hidden="true">
                <LightbulbIcon />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Därför bygger vi FyndBo.se</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-200 mb-5 pl-9">
              Vi tror att teknik kan göra bostadsmarknaden mer transparent, rättvis och tillgänglig. 
              Därför skapar vi en plattform som sätter dig i första rummet.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Transparent prissättning', desc: 'Inga dolda avgifter' },
                { title: 'Mäklare för dig', desc: 'Deras incitament är din glädje' },
                { title: 'Modern sökmotor', desc: 'Hitta drömhemmet snabbt' },
                { title: 'Alla annonser samlade', desc: 'Oavsett var de är publicerade' },
              ].map((item) => (
                <div key={item.title} className="bg-white/5 rounded-xl p-3 text-center hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex justify-center mb-2" aria-hidden="true">
                    <div className="text-emerald-400 group-hover:scale-110 transition-transform">
                      <CheckIcon />
                    </div>
                  </div>
                  <p className="font-medium text-white text-xs sm:text-sm">{item.title}</p>
                  <p className="text-gray-300 text-[10px] sm:text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Citat */}
          <figure className="text-center pt-8">
            <div className="flex justify-center mb-3" aria-hidden="true">
              <div className="text-gray-400 opacity-50">
                <QuoteIcon />
              </div>
            </div>
            <blockquote className="text-gray-200 italic text-base sm:text-lg max-w-2xl mx-auto">
              <p>"En bättre väg till ditt nästa hem – utan krångel och dolda agendor."</p>
            </blockquote>
            <figcaption className="text-blue-400 mt-4 font-medium text-sm sm:text-base">
              — Teamet bakom <cite className="not-italic">FyndBo.se</cite>
            </figcaption>
          </figure>

          {/* Tillbaka-knapp */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Gå tillbaka till startsidan"
            >
              <ArrowLeftIcon />
              <span>Tillbaka till startsidan</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-xs sm:text-sm text-gray-300">© 2026 FyndBo.se – En plattform för bostadssökande</p>
        </footer>
      </main>
    </div>
  )
}