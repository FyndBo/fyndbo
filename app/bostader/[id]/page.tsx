'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-sm">
      Laddar karta...
    </div>
  ),
})

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
  listing_url: string | null
  latitude: number | null
  longitude: number | null
  monthly_fee: number | null
  operating_cost: number | null
  floor: string | null
  elevator: boolean | null
  balcony: boolean | null
  images: string[]
  property_type: string | null
  construction_year: number | null
  plot_area: number | null
  energy_class: string | null
  association: string | null
  created_at: string
}

export default function PropertyDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (!id) return
    fetch(`/api/properties/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setProperty(data.property)
      })
      .catch(() => setError('Kunde inte hämta bostaden'))
      .finally(() => setLoading(false))
  }, [id])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('sv-SE').format(price) + ' kr'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Laddar bostad...</p>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Bostaden hittades inte'}</p>
          <Link href="/bostader" className="text-blue-400 hover:underline">
            ← Tillbaka till bostäder
          </Link>
        </div>
      </div>
    )
  }

  const allImages: string[] = property.images?.length
    ? property.images
    : property.image_url
    ? [property.image_url]
    : []

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/bostader"
            className="text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tillbaka
          </Link>
          <h1 className="text-xl font-bold truncate">{property.title}</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Vänster kolumn – bilder och fakta */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bildgalleri */}
            {allImages.length > 0 && (
              <div className="space-y-2">
                <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden">
                  <img
                    src={allImages[activeImage]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                          idx === activeImage
                            ? 'border-blue-500'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`bild ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pris och adress */}
            <div>
              <p className="text-3xl font-bold text-blue-400">
                {formatPrice(property.price)}
              </p>
              <p className="text-slate-300 mt-1">
                {[property.address, property.city].filter(Boolean).join(', ')}
              </p>
              {property.property_type && (
                <span className="inline-block mt-2 text-xs bg-slate-700 px-3 py-1 rounded-full text-white capitalize">
                  {property.property_type}
                </span>
              )}
            </div>

            {/* Fakta i grid – 2 kolumner */}
            <div className="grid grid-cols-2 gap-4">
              {property.area && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-400 text-xs uppercase">Boarea</p>
                  <p className="text-white font-semibold">{property.area} m²</p>
                </div>
              )}
              {property.rooms && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-400 text-xs uppercase">Antal rum</p>
                  <p className="text-white font-semibold">{property.rooms} rum</p>
                </div>
              )}
              {property.monthly_fee && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-400 text-xs uppercase">Månadsavgift</p>
                  <p className="text-white font-semibold">
                    {property.monthly_fee.toLocaleString('sv-SE')} kr/mån
                  </p>
                </div>
              )}
              {property.operating_cost && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-400 text-xs uppercase">Driftkostnad</p>
                  <p className="text-white font-semibold">
                    {property.operating_cost.toLocaleString('sv-SE')} kr/år
                  </p>
                </div>
              )}
              {property.floor && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-400 text-xs uppercase">Våning</p>
                  <p className="text-white font-semibold">{property.floor}</p>
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-slate-400 text-xs uppercase">Pris/m²</p>
                <p className="text-white font-semibold">
                  {property.area
                    ? Math.round(property.price / property.area).toLocaleString('sv-SE') + ' kr/m²'
                    : '—'}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-slate-400 text-xs uppercase">Hiss</p>
                <p className="text-white font-semibold">
                  {property.elevator ? 'Ja' : 'Nej'}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-slate-400 text-xs uppercase">Balkong</p>
                <p className="text-white font-semibold">
                  {property.balcony ? 'Ja' : 'Nej'}
                </p>
              </div>
              {property.construction_year && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-400 text-xs uppercase">Byggår</p>
                  <p className="text-white font-semibold">{property.construction_year}</p>
                </div>
              )}
              {property.plot_area && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-400 text-xs uppercase">Tomtarea</p>
                  <p className="text-white font-semibold">{property.plot_area} m²</p>
                </div>
              )}
              {property.energy_class && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-400 text-xs uppercase">Energiklass</p>
                  <p className="text-white font-semibold">{property.energy_class.toUpperCase()}</p>
                </div>
              )}
              {property.association && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-slate-400 text-xs uppercase">Förening</p>
                  <p className="text-white font-semibold text-sm truncate">{property.association}</p>
                </div>
              )}
            </div>

            {/* Beskrivning */}
            {property.description && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Beskrivning</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}
          </div>

          {/* Höger kolumn – karta och CTA */}
          <div className="space-y-6">
            {/* Karta */}
            {property.latitude != null && property.longitude != null && (
              <div className="h-64 rounded-2xl overflow-hidden border border-white/10">
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                />
              </div>
            )}

            {/* Länk till mäklarens annons */}
            {property.listing_url && (
              <a
                href={property.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 rounded-xl transition"
              >
                Besök annons
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}