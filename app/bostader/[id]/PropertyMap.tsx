'use client'

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'

import { useEffect } from 'react'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

// ============================================================
// PROPS
// ============================================================

interface PropertyMapProps {
  latitude: number
  longitude: number
  title: string
  address?: string
}

// ============================================================
// MARKER
// ============================================================

const markerIcon = L.divIcon({
  className: '',

  html: `
    <div
      style="
        position:relative;
        width:34px;
        height:34px;
        display:flex;
        align-items:center;
        justify-content:center;
      "
    >
      <div
        style="
          position:absolute;
          width:34px;
          height:34px;
          border-radius:9999px;
          background:rgba(37,99,235,.18);
        "
      ></div>

      <div
        style="
          position:relative;
          width:18px;
          height:18px;
          border-radius:9999px;
          background:#2563eb;
          border:3px solid white;
          box-shadow:0 5px 14px rgba(15,23,42,.30);
        "
      ></div>
    </div>
  `,

  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
})

// ============================================================
// RESIZE
// ============================================================

function MapUpdater({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) {
  const map = useMap()

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        map.invalidateSize()

        map.setView(
          [
            latitude,
            longitude,
          ],
          15
        )
      }, 100)

    return () =>
      window.clearTimeout(timer)
  }, [
    map,
    latitude,
    longitude,
  ])

  return null
}

// ============================================================
// COMPONENT
// ============================================================

export default function PropertyMap({
  latitude,
  longitude,
  title,
  address,
}: PropertyMapProps) {
  return (
    <div className="relative h-full w-full">

      <style jsx global>{`
        .property-map-popup
          .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          box-shadow: 0 12px 30px
            rgba(15, 23, 42, 0.25) !important;
        }

        .property-map-popup
          .leaflet-popup-content {
          margin: 14px 16px !important;
        }

        .property-map-popup
          .leaflet-popup-tip {
          background: white;
        }
      `}</style>

      <MapContainer
        center={[
          latitude,
          longitude,
        ]}
        zoom={15}
        minZoom={5}
        maxZoom={19}
        scrollWheelZoom
        zoomControl
        attributionControl={false}
        style={{
          height: '100%',
          width: '100%',
          background: '#e2e8f0',
        }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />

        <MapUpdater
          latitude={latitude}
          longitude={longitude}
        />

        <Marker
          position={[
            latitude,
            longitude,
          ]}
          icon={markerIcon}
        >

          <Popup
            className="property-map-popup"
            closeButton={false}
          >

            <div className="min-w-[170px]">

              <p className="text-sm font-semibold text-slate-900">
                {title}
              </p>

              {address && (
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {address}
                </p>
              )}

            </div>

          </Popup>

        </Marker>

      </MapContainer>

    </div>
  )
}