'use client'
import Link from 'next/link'

export default function OmSida() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 relative overflow-hidden">
      {/* Bakgrund – mjuka, glada former */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* Glada prickar */}
        <div className="absolute top-32 left-[15%] w-2 h-2 bg-yellow-300/40 rounded-full"></div>
        <div className="absolute top-56 right-[20%] w-3 h-3 bg-blue-300/40 rounded-full"></div>
        <div className="absolute bottom-40 left-[25%] w-2 h-2 bg-pink-300/40 rounded-full"></div>
        <div className="absolute bottom-32 right-[30%] w-3 h-3 bg-green-300/40 rounded-full"></div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* STÖRRE logga */}
        <div className="text-center mb-12">
          <img src="/Fyndbo-blue-bkg.png" alt="FyndBo.se" className="h-40 md:h-56 lg:h-72 mx-auto w-auto hover:scale-105 transition-transform duration-500 drop-shadow-2xl" />
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-block mb-4 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
              <p className="text-xs text-white/70 tracking-wider uppercase">✨ Varför FyndBo ✨</p>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">En bostadsmarknad som fungerar för alla</h1>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Vi har studerat dagens system och identifierat flera grundläggande brister. FyndBo.se är vårt svar.
            </p>
          </div>

          <div className="space-y-6 text-slate-300 leading-relaxed">
            {/* Problem 1 */}
            <div className="bg-rose-500/10 rounded-xl p-6 border-l-4 border-rose-400">
              <h3 className="text-lg font-semibold text-white mb-2">📈 Orimliga kostnader</h3>
              <p>
                Priserna för att synas på de stora plattformarna har skjutit i höjden. Det som en gång var en rimlig avgift har blivit en rejäl tröskel.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-amber-500/10 rounded-xl p-6 border-l-4 border-amber-400">
              <h3 className="text-lg font-semibold text-white mb-2">🎯 Fel incitament</h3>
              <p>
                Dagens modell premierar volym och höga priser framför kundnytta. Det är inte den som skapar mest värde som vinner.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-slate-500/10 rounded-xl p-6 border-l-4 border-slate-400">
              <h3 className="text-lg font-semibold text-white mb-2">⚙️ Gammal teknik</h3>
              <p>
                Trots miljardvärden har den tekniska utvecklingen stått stilla. Sökfunktioner, kartor och filtrering fungerar undermåligt.
              </p>
            </div>

            {/* Lösningen */}
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-6 border-l-4 border-blue-400 mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">💡 Därför bygger vi FyndBo.se</h3>
              <p className="mb-4 text-slate-200">
                Vi tror att teknik kan göra bostadsmarknaden mer transparent, rättvis och tillgänglig. Därför skapar vi en plattform som sätter dig i första rummet.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="font-medium text-white">🔍 Transparent prissättning</p>
                  <p className="text-sm text-slate-300">Inga dolda avgifter</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="font-medium text-white">🤝 Mäklare som jobbar för dig</p>
                  <p className="text-sm text-slate-300">Deras incitament är din glädje</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="font-medium text-white">⚡ Modern sökmotor</p>
                  <p className="text-sm text-slate-300">Hitta drömhemmet snabbt</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="font-medium text-white">🏠 Alla annonser samlade</p>
                  <p className="text-sm text-slate-300">Oavsett var de är publicerade</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-slate-300 italic">
                "En bättre väg till ditt nästa hem – utan krångel och dolda agendor."
              </p>
              <p className="text-blue-300 mt-4 font-medium">— Teamet bakom FyndBo.se</p>
            </div>
          </div>

          {/* Tillbaka-knapp */}
          <div className="mt-10 text-center">
            <Link 
              href="/" 
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Tillbaka till startsidan</span>
            </Link>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400">© 2026 FyndBo.se – En plattform för bostadssökande</p>
        </footer>
      </main>
    </div>
  )
}