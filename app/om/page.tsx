'use client'
import Link from 'next/link'

export default function OmSida() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Bakgrundselement */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-0 w-full h-full">
          <div className="absolute bottom-10 left-[10%] w-32 h-32 bg-gradient-to-t from-blue-400/20 to-transparent rounded-t-2xl"></div>
          <div className="absolute bottom-10 left-[30%] w-48 h-48 bg-gradient-to-t from-indigo-400/20 to-transparent rounded-t-2xl"></div>
          <div className="absolute bottom-10 left-[60%] w-40 h-40 bg-gradient-to-t from-purple-400/20 to-transparent rounded-t-2xl"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Logga */}
        <div className="flex justify-center mb-16">
          <img src="/FyndBo-blue-bkg.png" alt="FyndBo.se" className="h-32 md:h-40 w-auto hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Innehåll */}
        <div className="bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/5 p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-block mb-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
              <p className="text-xs text-gray-400 tracking-wider">✦ BAKOM FYNDBO.SE ✦</p>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">En tonårings vision</h1>
            <p className="text-md text-gray-400 max-w-xl mx-auto">
              Jag är en 17-årig utvecklare från Sverige som vill göra husmarknaden enklare för alla.
            </p>
          </div>

          <div className="space-y-8 text-gray-300">
            <div className="bg-white/5 rounded-xl p-6 border-l-4 border-blue-500">
              <p className="leading-relaxed">
                <span className="text-blue-400 font-semibold">Varför?</span> För att jag själv har sett hur svårt det kan vara för vanligt folk att navigera bland alla bostadsannonser. Olika plattformar, varierande priser och spridd information.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border-l-4 border-indigo-500">
              <p className="leading-relaxed">
                <span className="text-indigo-400 font-semibold">Min lösning?</span> <span className="text-white font-medium">FyndBo.se</span> – en plattform som samlar alla bostadsannonser på ett och samma ställe. Enkelt, snabbt och överskådligt.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl p-6 text-center border border-blue-500/20">
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="text-lg font-semibold text-white mb-2">För köpare</h3>
                <p className="text-gray-400 text-sm">Hitta ditt drömhem – sök bland alla annonser från alla plattformar.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl p-6 text-center border border-purple-500/20">
                <div className="text-4xl mb-3">📢</div>
                <h3 className="text-lg font-semibold text-white mb-2">För säljare</h3>
                <p className="text-gray-400 text-sm">Nå fler spekulanter – synas där alla redan letar.</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-400 italic">
                "Enklare, snabbare, smartare – det är framtiden för husförsäljning."
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/" className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Tillbaka till startsidan
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-gray-600">© 2026 FyndBo.se – En plattform för bostadssökande</p>
        </footer>
      </div>
    </div>
  )
}