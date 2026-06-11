'use client'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
}

interface MapComponentProps {
  properties: Property[]
  hoveredId: number | null
}

// Markörer (blå och röd)
const blueIcon = L.divIcon({
  html: `<svg width="14" height="20" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#3B82F6" stroke="#fff" stroke-width="1.5"/></svg>`,
  className: '',
  iconSize: [14, 20],
  iconAnchor: [7, 20],
  popupAnchor: [0, -20],
})

const redIcon = L.divIcon({
  html: `<svg width="18" height="24" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#EF4444" stroke="#fff" stroke-width="1.5"/></svg>`,
  className: '',
  iconSize: [18, 24],
  iconAnchor: [9, 24],
  popupAnchor: [0, -24],
})

// Skapar masken: världsrektangel + hål för ALLA features (Sverige och Grönland)
function createSwedenMask(geoJSON: any) {
  if (!geoJSON?.features || geoJSON.features.length === 0) {
    console.warn('Inga features i GeoJSON')
    return null
  }

  // Rektangel som täcker hela världen
  const worldRing = [[-180, 90], [180, 90], [180, -90], [-180, -90], [-180, 90]]
  const holes: any[] = []

  // Iterera över ALLA features (både Sverige och Grönland)
  geoJSON.features.forEach((feature: any) => {
    if (!feature.geometry) return
    const { type, coordinates } = feature.geometry
    if (type === 'Polygon') {
      holes.push(coordinates[0])
    } else if (type === 'MultiPolygon') {
      // För MultiPolygon, ta alla delpolygoner (så att öar också blir hål)
      coordinates.forEach((poly: any) => holes.push(poly[0]))
    }
  })

  console.log(`✅ Mask skapad med ${holes.length} hål (länder/områden)`)
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [worldRing, ...holes]
    }
  }
}

export default function MapComponent({ properties, hoveredId }: MapComponentProps) {
  const formatPrice = (price: number) => new Intl.NumberFormat('sv-SE').format(price) + ' kr'
  const [borderData, setBorderData] = useState<any>(null)

  // Ladda sweden_border.geojson (innehåller både Sverige och Grönland)
  useEffect(() => {
    fetch('/sweden_border.geojson')
      .then(r => r.json())
      .then(data => {
        console.log('📂 sweden_border.geojson laddad, features:', data.features?.length)
        setBorderData(data)
      })
      .catch(err => console.error('❌ Fel vid laddning av sweden_border.geojson:', err))
  }, [])

  const swedenMask = useMemo(() => {
    if (!borderData) return null
    return createSwedenMask(borderData)
  }, [borderData])

  const filteredProperties = properties.filter(p => p.latitude && p.longitude)

  return (
    <MapContainer
      center={[62.5, 16.0]}
      zoom={4.5}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', background: '#e8e4df' }}
      zoomControl={false}
      attributionControl={false}
      minZoom={2}
      maxBounds={[[-85, -180], [85, 180]]}
      maxBoundsViscosity={0.8}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        noWrap={true}
      />

      {/* Mörk overlay med hål för ALLA länder i filen (Sverige + Grönland) */}
      {swedenMask && (
        <GeoJSON
          data={swedenMask!}
          style={{
            color: '#1e3a5f',      // Mörkblå kontur runt varje hål
            fillColor: '#0f172a',  // Nästan svart fyllning
            fillOpacity: 0.8,
            weight: 1.5,
            opacity: 1,
          }}
        />
      )}

      {/* Inga interna gränser ritas */}

      {filteredProperties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude!, property.longitude!]}
          icon={hoveredId === property.id ? redIcon : blueIcon}
        >
          <Popup>
            <div style={{ minWidth: 140 }}>
              <h3 className="font-semibold text-gray-900 text-xs">{property.title}</h3>
              <p className="text-blue-600 font-bold text-xs">{formatPrice(property.price)}</p>
              <p className="text-gray-500 text-[10px]">{property.city}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}