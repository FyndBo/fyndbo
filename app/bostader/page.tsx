'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Property {
  id: number
  title: string
  price: number
  area: number | null
  rooms: number | null
  city: string | null
  address: string | null
  image_url: string | null
  latitude: number | null
  longitude: number | null
  monthly_fee: number | null
  floor: string | null
  elevator: boolean | null
  balcony: boolean | null
  images: string[]
  property_type: string | null
  energy_class: string | null
}

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-800 flex items-center justify-center"><p className="text-white animate-pulse">Laddar karta...</p></div>,
})

// ============================================================
// Egna SVG-ikoner
// ============================================================
const Icons = {
  search: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeLinecap="round"/>
    </svg>
  ),
  home: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  filter: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeLinejoin="round"/>
    </svg>
  ),
  building: () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="1" stroke="currentColor" fill="none"/>
    </svg>
  ),
  rooms: () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  price: () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeLinecap="round"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  login: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" stroke="currentColor" fill="none"/>
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  ),
}

// ============================================================
// Data för filtermenyer
// ============================================================
const propertyTypes = [
  { value: '', label: 'Alla typer' },
  { value: 'villa', label: 'Villa' },
  { value: 'lägenhet', label: 'Lägenhet' },
  { value: 'radhus', label: 'Radhus' },
  { value: 'fritidshus', label: 'Fritidshus' },
  { value: 'tomt', label: 'Tomt' },
  { value: 'gård', label: 'Gård/Skog' },
]

const roomOptions = [
  { value: '', label: 'Alla' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
]

export default function BostaderPage() {
  const searchParams = useSearchParams()

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [mapExpanded, setMapExpanded] = useState(false)

  // Filter states
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [minRooms, setMinRooms] = useState(searchParams.get('minRooms') || '')
  const [showFilters, setShowFilters] = useState(false)

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (city) params.append('city', city)
      if (propertyType) params.append('property_type', propertyType)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      if (minRooms) params.append('minRooms', minRooms)

      const res = await fetch(`/api/properties?${params.toString()}`)
      const data = await res.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [city, propertyType, minPrice, maxPrice, minRooms])

  const formatPrice = (price: number) => new Intl.NumberFormat('sv-SE').format(price) + ' kr'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProperties()
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* ========== HEADER ========== */}
      <header className="bg-slate-800 border-b border-white/10 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/Fyndbo-blue-bkg.png" alt="FyndBo" className="h-8 w-auto" />
            <span className="text-white font-bold text-lg hidden sm:block">FyndBo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-300 hover:text-white transition text-sm">Startsida</Link>
            <Link href="/bostader" className="text-white font-medium text-sm">Bostäder</Link>
            <Link href="/om" className="text-slate-300 hover:text-white transition text-sm">Om oss</Link>
          </nav>

          <Link
            href="/admin/login"
            className="text-slate-400 hover:text-white text-sm transition flex items-center gap-1"
          >
            <Icons.login />
            <span className="hidden sm:inline">Logga in</span>
          </Link>
        </div>

        {/* Sökrad */}
        <div className="max-w-[1600px] mx-auto px-4 pb-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-xl">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.search /></div>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Sök på stad eller område..."
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition ${
                showFilters ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Icons.filter />
            </button>
          </form>

          {showFilters && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.building /></div>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {propertyTypes.map(pt => <option key={pt.value} value={pt.value} className="bg-slate-800">{pt.label}</option>)}
                </select>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.rooms /></div>
                <select
                  value={minRooms}
                  onChange={(e) => setMinRooms(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {roomOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>)}
                </select>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.price /></div>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min kr"
                  className="w-full pl-9 pr-2 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.price /></div>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max kr"
                  className="w-full pl-9 pr-2 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button type="submit" className="col-span-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition">
                Uppdatera sökning
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Huvudyta: karta + lista */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`${mapExpanded ? 'fixed inset-0 z-20' : 'hidden md:block md:w-[60%]'} h-full relative`}>
          <MapComponent properties={properties} hoveredId={hoveredId} mapExpanded={mapExpanded} />
          <button
            onClick={() => setMapExpanded(!mapExpanded)}
            className="absolute top-4 right-4 z-30 bg-white hover:bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium transition"
          >
            {mapExpanded ? 'Förminska karta' : 'Förstora karta'}
          </button>
        </div>

        <div className={`${mapExpanded ? 'hidden' : 'w-full md:w-[40%]'} flex flex-col h-full`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-20"><p className="text-white animate-pulse">Laddar...</p></div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-slate-400">Inga bostäder hittades</p>
                <p className="text-slate-500 text-xs mt-2">Prova att justera dina filter</p>
              </div>
            ) : (
              properties.map((property, index) => (
                <div key={property.id}>
                  {index > 0 && index % 10 === 0 && (
                    <div className="bg-white/5 rounded-xl border border-dashed border-white/20 p-3 mb-3 text-center text-slate-400 text-xs">Annons</div>
                  )}
                  <Link
                    href={`/bostader/${property.id}`}
                    className="group bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition flex"
                    onMouseEnter={() => setHoveredId(property.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="w-24 h-24 flex-shrink-0 bg-slate-800">
                      {(property.images?.length || property.image_url) ? (
                        <img src={property.images?.[0] || property.image_url!} alt={property.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600"><Icons.home /></div>
                      )}
                    </div>
                    <div className="p-3 flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate">{property.title}</h3>
                      <p className="text-blue-400 font-bold text-base mt-0.5">{formatPrice(property.price)}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-slate-400 text-xs">
                        {property.area && <span>{property.area} m²</span>}
                        {property.rooms && <span>{property.rooms} rum</span>}
                        {property.monthly_fee && <span className="text-slate-500">{property.monthly_fee.toLocaleString('sv-SE')} kr/mån</span>}
                      </div>
                      <p className="text-slate-500 text-xs mt-1 truncate">{[property.address, property.city].filter(Boolean).join(', ')}</p>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}