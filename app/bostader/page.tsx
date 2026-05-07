'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Property {
  id: number
  title: string
  description: string
  price: number
  area: number
  rooms: number
  address: string
  city: string
  image_url: string
  created_at: string
}

export default function BostaderPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties')
      const data = await res.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE').format(price) + ' kr'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Laddar...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/" className="text-blue-400 hover:text-blue-300 transition">← Tillbaka till startsidan</Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">🏠 Bostäder till salu</h1>
        <p className="text-slate-300 mt-2">Hitta ditt drömhem</p>

        {properties.length === 0 ? (
          <div className="text-center py-20 bg-white/10 rounded-2xl mt-8">
            <p className="text-slate-300 text-lg">Inga bostäder tillagda ännu</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {properties.map((property) => (
              <div key={property.id} className="bg-white/10 rounded-2xl border border-white/20 p-5">
                <h3 className="text-xl font-semibold text-white">{property.title}</h3>
                <p className="text-blue-400 font-bold text-lg mt-2">{formatPrice(property.price)}</p>
                {property.area && <p className="text-slate-300 text-sm">{property.area} m²</p>}
                {property.rooms && <p className="text-slate-300 text-sm">{property.rooms} rum</p>}
                <p className="text-slate-400 text-sm mt-2">{property.city}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}