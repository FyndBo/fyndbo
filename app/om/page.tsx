'use client'
import Link from 'next/link'

export default function OmSida() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-50">
        <div className="absolute top-20 left-10 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Logga - större på mobil */}
        <div className="text-center mb-8 sm:mb-12">
          <img 
            src="/Fyndbo-blue-bkg.png" 
            alt="FyndBo.se" 
            className="h-24 sm:h-28 md:h-32 lg:h-40 xl:h-48 2xl:h-56 mx-auto w-auto hover:scale-105 transition-transform duration-500" 
          />
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 p-5 sm:p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-6 sm:mb-10">
            <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
              <p className="text-[10px] sm:text-xs text-white/70 tracking-wider uppercase">✦ Varför FyndBo ✦</p>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">En bostadsmarknad som fungerar för alla</h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto px-2">
              Vi har studerat dagens system och identifierat flera grundläggande brister. FyndBo.se är vårt svar.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 text-slate-300 leading-relaxed">
            <div className="bg-rose-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-rose-400">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">📈 Orimliga kostnader</h3>
              <p className="text-sm sm:text-base">
                Priserna för att synas på de stora plattformarna har skjutit i höjden. Det som en gång var en rimlig avgift har blivit en rejäl tröskel.
              </p>
            </div>

            <div className="bg-amber-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-amber-400">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">🎯 Fel incitament</h3>
              <p className="text-sm sm:text-base">
                Dagens modell premierar volym och höga priser framför kundnytta. Det är inte den som skapar mest värde som vinner.
              </p>
            </div>

            <div className="bg-slate-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-slate-400">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">⚙️ Gammal teknik</h3>
              <p className="text-sm sm:text-base">
                Trots miljardvärden har den tekniska utvecklingen stått stilla. Sökfunktioner, kartor och filtrering fungerar undermåligt.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-blue-400 mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">💡 Därför bygger vi FyndBo.se</h3>
              <p className="text-sm sm:text-base text-slate-200 mb-3 sm:mb-4">
                Vi tror att teknik kan göra bostadsmarknaden mer transparent, rättvis och tillgänglig. Därför skapar vi en plattform som sätter dig i första rummet.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                  <p className="font-medium text-white text-sm">🔍 Transparent prissättning</p>
                  <p className="text-xs sm:text-sm text-slate-300">Inga dolda avgifter</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                  <p className="font-medium text-white text-sm">🤝 Mäklare som jobbar för dig</p>
                  <p className="text-xs sm:text-sm text-slate-300">Deras incitament är din glädje</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                  <p className="font-medium text-white text-sm">⚡ Modern sökmotor</p>
                  <p className="text-xs sm:text-sm text-slate-300">Hitta drömhemmet snabbt</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2 sm:p-3">
                  <p className="font-medium text-white text-sm">🏠 Alla annonser samlade</p>
                  <p className="text-xs sm:text-sm text-slate-300">Oavsett var de är publicerade</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-slate-300 italic text-sm sm:text-base">
                "En bättre väg till ditt nästa hem – utan krångel och dolda agendor."
              </p>
              <p className="text-blue-300 mt-3 sm:mt-4 font-medium text-sm sm:text-base">— Teamet bakom FyndBo.se</p>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Link 
              href="/" 
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-5 sm:px-8 py-2.5 sm:py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Tillbaka till startsidan</span>
            </Link>
          </div>
        </div>

        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400">© 2026 FyndBo.se – En plattform för bostadssökande</p>
        </footer>
      </main>
    </div>
  )
}