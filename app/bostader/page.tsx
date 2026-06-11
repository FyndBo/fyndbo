'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

interface Property {
  id: number
  title: string
  description: string | null
  price: number
  area: number | null
  rooms: number | null
  address: string | null
  city: string | null
  image_url: string | null
  latitude: number | null
  longitude: number | null
}

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-slate-800 rounded-2xl flex items-center justify-center">
      <p className="text-white animate-pulse">Laddar karta...</p>
    </div>
  ),
})

const Icons = {
  search: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" stroke="currentColor" fill="none"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeLinecap="round"/>
    </svg>
  ),
  home: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  expand: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  ),
  collapse: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
      <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  ),
}

export default function BostaderPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [mapExpanded, setMapExpanded] = useState(false)

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
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
  }, [search])

  const formatPrice = (price: number) => new Intl.NumberFormat('sv-SE').format(price) + ' kr'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProperties()
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition"><Icons.home /></Link>
          <h1 className="text-lg font-bold text-white">Bostäder till salu</h1>
          <span className="text-slate-400 text-sm">{properties.length} st</span>
        </div>
      </header>

      <div className="bg-slate-800/50 border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Icons.search />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök bostad – t.ex. Stockholm, villa..."
                className="w-full pl-12 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`relative mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 ${mapExpanded ? 'w-full h-[500px]' : 'w-full max-w-2xl h-[300px]'}`}>
          <MapComponent
            properties={properties}
            hoveredId={hoveredId}
          />
          <button
            onClick={() => setMapExpanded(!mapExpanded)}
            className="absolute top-3 right-3 z-[1000] bg-white hover:bg-gray-100 text-gray-800 p-2 rounded-lg shadow-lg transition text-xs flex items-center gap-1.5 font-medium"
          >
            {mapExpanded ? <><Icons.collapse /> Förminska</> : <><Icons.expand /> Förstora</>}
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-10"><p className="text-white animate-pulse">Laddar...</p></div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10 bg-white/5 rounded-2xl"><p className="text-slate-400">Inga bostäder hittades</p></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white/5 rounded-xl border border-white/10 p-4 hover:border-blue-500/30 transition cursor-pointer"
                  onMouseEnter={() => setHoveredId(property.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex gap-3">
                    {property.image_url && (
                      <img src={property.image_url} alt={property.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">{property.title}</h3>
                      <p className="text-blue-400 font-bold text-sm mt-1">{formatPrice(property.price)}</p>
                      <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs">
                        {property.area && <span>{property.area} m²</span>}
                        {property.rooms && <span>· {property.rooms} rum</span>}
                      </div>
                      <p className="text-slate-500 text-xs mt-1 truncate">{[property.address, property.city].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}