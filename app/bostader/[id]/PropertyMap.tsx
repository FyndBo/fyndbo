'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface PropertyMapProps {
  latitude: number
  longitude: number
  title: string
}

const markerIcon = L.divIcon({
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #2563eb;
    border: 3px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3), 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export default function PropertyMap({ latitude, longitude, title }: PropertyMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]} icon={markerIcon}>
        <Popup>{title}</Popup>
      </Marker>
    </MapContainer>
  )
}