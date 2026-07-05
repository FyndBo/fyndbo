'use client'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
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
  mapExpanded: boolean
}

// Eleganta markörer – blå cirkel med vit kant och skugga
const markerIcon = L.divIcon({
  html: `
    <div style="
      width: 16px;
      height: 16px;
      background: #2563eb;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3), 0 2px 6px rgba(0,0,0,0.3);
    "></div>
  `,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
})

const hoverIcon = L.divIcon({
  html: `
    <div style="
      width: 22px;
      height: 22px;
      background: #dc2626;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.4), 0 3px 8px rgba(0,0,0,0.4);
    "></div>
  `,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
})

// Skapar masken: världsrektangel + hål för ALLA features (Sverige och Grönland)
function createSwedenMask(geoJSON: any) {
  if (!geoJSON?.features || geoJSON.features.length === 0) return null

  const worldRing = [[-180, 90], [180, 90], [180, -90], [-180, -90], [-180, 90]]
  const holes: any[] = []

  geoJSON.features.forEach((feature: any) => {
    if (!feature.geometry) return
    const { type, coordinates } = feature.geometry
    if (type === 'Polygon') holes.push(coordinates[0])
    else if (type === 'MultiPolygon') coordinates.forEach((poly: any) => holes.push(poly[0]))
  })

  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [worldRing, ...holes]
    }
  }
}

// Hjälpkomponent för att uppdatera kartstorlek vid expandering
function MapSizeUpdater({ mapExpanded }: { mapExpanded: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (map) setTimeout(() => map.invalidateSize(), 100)
  }, [mapExpanded, map])
  return null
}

export default function MapComponent({ properties, hoveredId, mapExpanded }: MapComponentProps) {
  const formatPrice = (price: number) => new Intl.NumberFormat('sv-SE').format(price) + ' kr'
  const [borderData, setBorderData] = useState<any>(null)
  const [mapKey] = useState(() => Date.now())

  useEffect(() => {
    fetch('/sweden_border.geojson')
      .then(r => r.json())
      .then(data => setBorderData(data))
      .catch(err => console.error('Kunde inte ladda sweden_border.geojson:', err))
  }, [])

  const swedenMask = useMemo(() => {
    if (!borderData) return null
    return createSwedenMask(borderData)
  }, [borderData])

  const filteredProperties = properties.filter(p => p.latitude && p.longitude)

  return (
    <MapContainer
      key={mapKey}
      center={[62.5, 16.0]}
      zoom={4.5}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', background: '#f8fafc' }}
      zoomControl={true}
      attributionControl={false}
      minZoom={4}
      maxBounds={[[35, -20], [72, 50]]}
      maxBoundsViscosity={1.0}
    >
      {/* Klassisk OpenStreetMap – pålitlig och gratis */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Din MapTiler-karta (aktivera senare om du vill)
      <TileLayer
        url="https://api.maptiler.com/maps/019f33bb-4ad8-76da-847a-124275c06bcf/style.json?key=pyfLqHxAveCHK2gF0LvF"
        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      */}

      {/* Mörk overlay med dämpad kontur */}
      {swedenMask && (
        <GeoJSON
          data={swedenMask!}
          style={{
            color: '#1e3a5f',
            fillColor: '#1e293b',
            fillOpacity: 0.35,
            weight: 2.5,
            opacity: 1,
          }}
        />
      )}

      <MapSizeUpdater mapExpanded={mapExpanded} />

      {/* Markörer för bostäder */}
      {filteredProperties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude!, property.longitude!]}
          icon={hoveredId === property.id ? hoverIcon : markerIcon}
        >
          <Popup>
            <div style={{ minWidth: 140, fontFamily: 'system-ui' }}>
              <h3 style={{ fontWeight: 600, fontSize: 13, margin: '0 0 4px', color: '#1e293b' }}>{property.title}</h3>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#2563eb', margin: '0 0 4px' }}>{formatPrice(property.price)}</p>
              {property.city && <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{property.city}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}