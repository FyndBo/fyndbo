'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================
// Egna SVG-ikoner
// ============================================================
const Icons = {
  search: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeLinecap="round"/>
    </svg>
  ),
  arrowRight: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  building: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="1" stroke="currentColor" fill="none"/>
      <line x1="9" y1="6" x2="9" y2="6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="15" y1="6" x2="15" y2="6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="10" x2="9" y2="10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="15" y1="10" x2="15" y2="10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="14" x2="9" y2="14.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="15" y1="14" x2="15" y2="14.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  rooms: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="8" y="11" width="3" height="3" fill="currentColor" stroke="none"/>
    </svg>
  ),
  price: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeLinecap="round"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevronDown: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevronUp: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 15 12 9 6 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

// ============================================================
// Panel som kan öppnas uppåt eller nedåt
// ============================================================
function SelectPanel({
  isOpen,
  options,
  value,
  onChange,
  onClose,
  position = 'bottom',
}: {
  isOpen: boolean
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
  onClose: () => void
  position?: 'top' | 'bottom'
}) {
  if (!isOpen) return null

  const positionClasses =
    position === 'top'
      ? 'bottom-full mb-2'   // öppnas uppåt
      : 'top-full mt-2'       // öppnas nedåt

  return (
    <div
      className={`absolute left-0 right-0 z-30 bg-slate-800 border border-white/10 rounded-xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-200 ${positionClasses}`}
    >
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChange(opt.value)
              onClose()
            }}
            className={`px-2 py-1.5 text-xs rounded-lg transition font-medium ${
              opt.value === value
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Knapp + panel (med riktning)
// ============================================================
function SelectWithPanel({
  icon,
  label,
  options,
  value,
  onChange,
  position = 'bottom',
}: {
  icon: React.ReactNode
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
  position?: 'top' | 'bottom'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find((o) => o.value === value)?.label || label

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm hover:border-white/30 transition"
      >
        <span className="flex items-center gap-2">
          {icon}
          <span className={value ? 'text-white' : 'text-white/40'}>{selectedLabel}</span>
        </span>
        {position === 'top' ? <Icons.chevronUp /> : <Icons.chevronDown />}
      </button>

      <SelectPanel
        isOpen={open}
        options={options}
        value={value}
        onChange={onChange}
        onClose={() => setOpen(false)}
        position={position}
      />
    </div>
  )
}

// ============================================================
// Data
// ============================================================
const propertyTypes = [
  { value: '', label: 'Alla' },
  { value: 'villa', label: 'Villa' },
  { value: 'lägenhet', label: 'Lägenhet' },
  { value: 'radhus', label: 'Radhus' },
  { value: 'fritidshus', label: 'Fritidshus' },
  { value: 'tomt', label: 'Tomt' },
  { value: 'gård', label: 'Gård' },
]

const roomOptions = [
  { value: '', label: 'Alla' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
]

export default function Startsida2() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [propertyType, setPropertyType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRooms, setMinRooms] = useState('')

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) setShowFilters(true)
  }

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.append('city', city)
    if (propertyType) params.append('property_type', propertyType)
    if (minPrice) params.append('minPrice', minPrice)
    if (maxPrice) params.append('maxPrice', maxPrice)
    if (minRooms) params.append('minRooms', minRooms)
    router.push(`/bostader?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-between overflow-hidden">
      {/* Bakgrundsdekorationer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Huvudinnehåll – alltid centrerat */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl w-full">
          <img src="/Fyndbo-blue-bkg.png" alt="FyndBo.se" className="h-32 sm:h-40 md:h-48 mx-auto mb-8 drop-shadow-2xl" />

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Hitta ditt nästa hem
          </h1>
          <p className="text-lg text-slate-300 mb-10 max-w-lg mx-auto">
            Sök bland bostäder till salu i hela Sverige
          </p>

          {/* Sökfält */}
          <form onSubmit={handleCitySubmit} className="max-w-md mx-auto mb-4">
            <div className="relative flex">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.search /></div>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Stad eller område, t.ex. Stockholm"
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg shadow-lg"
              />
              <button type="submit" className="ml-2 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition">
                <Icons.arrowRight />
              </button>
            </div>
          </form>

          {/* Filterpanel */}
          {showFilters && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <form onSubmit={handleFullSearch} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl text-left">
                <h3 className="text-white font-semibold mb-4">Förfina din sökning</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5"><Icons.building /> Bostadstyp</label>
                    {/* Öppnas uppåt så den täcker sökrutan */}
                    <SelectWithPanel
                      icon={<Icons.building />}
                      label="Bostadstyp"
                      options={propertyTypes}
                      value={propertyType}
                      onChange={setPropertyType}
                      position="top"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5"><Icons.rooms /> Antal rum</label>
                    {/* Öppnas nedåt som vanligt */}
                    <SelectWithPanel
                      icon={<Icons.rooms />}
                      label="Antal rum"
                      options={roomOptions}
                      value={minRooms}
                      onChange={setMinRooms}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5"><Icons.price /> Min pris (kr)</label>
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5"><Icons.price /> Max pris (kr)</label>
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Valfritt" className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button type="submit" className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition shadow-lg">
                  Sök bostäder
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-slate-500 text-sm">
        © 2026 FyndBo.se – En plattform för bostadssökande
      </footer>
    </div>
  )
}