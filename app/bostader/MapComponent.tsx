'use client'

import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useRouter } from 'next/navigation'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

// ============================================================
// TYPER
// ============================================================

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
  images: string[]
}

interface MapComponentProps {
  properties: Property[]
  hoveredId: number | null
  activePopupId: number | null
  onPopupChange: (
    id: number | null
  ) => void
}

// ============================================================
// FORMATTERING
// ============================================================

function formatPrice(price: number) {
  return (
    new Intl.NumberFormat(
      'sv-SE'
    ).format(price) + ' kr'
  )
}

function formatShortPrice(
  price: number
) {
  if (price >= 1_000_000) {
    const millions =
      price / 1_000_000

    return `${millions
      .toFixed(
        millions >= 10 ? 0 : 1
      )
      .replace('.', ',')} M`
  }

  if (price >= 1000) {
    return `${Math.round(
      price / 1000
    )} t`
  }

  return String(price)
}

// ============================================================
// MARKÖRIKON
// ============================================================

function createPriceIcon(
  price: number,
  active: boolean
) {
  const text = formatShortPrice(price)

  return L.divIcon({
    className: '',

    html: `
      <div
        style="
          display:flex;
          align-items:center;
          justify-content:center;
          min-width:${active ? 70 : 62}px;
          height:${active ? 34 : 30}px;
          padding:0 9px;
          background:${active ? '#2563eb' : '#ffffff'};
          color:${active ? '#ffffff' : '#0f172a'};
          border:${active ? '2px solid #ffffff' : '1px solid rgba(15,23,42,0.14)'};
          border-radius:9999px;
          font-family:Inter,system-ui,sans-serif;
          font-weight:700;
          font-size:${active ? 12 : 11}px;
          white-space:nowrap;
          box-shadow:0 5px 16px rgba(15,23,42,0.22);
          cursor:pointer;
          transition:all .18s ease;
        "
      >
        ${text}
      </div>
    `,

    iconSize: active
      ? [70, 34]
      : [62, 30],

    iconAnchor: active
      ? [35, 17]
      : [31, 15],

    popupAnchor: active
      ? [0, -20]
      : [0, -18],

    tooltipAnchor: active
      ? [0, -20]
      : [0, -18],
  })
}

// ============================================================
// MAP VIEW
// ============================================================

function MapViewportController({
  properties,
}: {
  properties: Property[]
}) {
  const map = useMap()

  useEffect(() => {
    const positions =
      properties
        .filter(
          (property) =>
            property.latitude != null &&
            property.longitude != null
        )
        .map(
          (property) =>
            [
              property.latitude!,
              property.longitude!,
            ] as [number, number]
        )

    const timer = window.setTimeout(
      () => {
        map.invalidateSize()

        if (positions.length === 0) {
          map.setView(
            [62.2, 16.3],
            5
          )
          return
        }

        if (positions.length === 1) {
          map.setView(
            positions[0],
            13
          )
          return
        }

        map.fitBounds(
          L.latLngBounds(positions),
          {
            padding: [45, 45],
            maxZoom: 12,
          }
        )
      },
      100
    )

    return () =>
      window.clearTimeout(timer)
  }, [map, properties])

  return null
}

// ============================================================
// EN MARKÖR
// ============================================================

function PropertyMarker({
  property,
  isHovered,
  isActive,
  onPopupChange,
}: {
  property: Property
  isHovered: boolean
  isActive: boolean
  onPopupChange: (
    id: number | null
  ) => void
}) {
  const router = useRouter()

  const markerRef =
    useRef<L.Marker | null>(null)

  const active =
    isHovered || isActive

  const icon = useMemo(
    () =>
      createPriceIcon(
        property.price,
        active
      ),
    [property.price, active]
  )

  const image =
    property.images?.[0] ||
    property.image_url

  // När man hovrar över bostadskortet
  // öppnas tooltipen på rätt markör.
  useEffect(() => {
    const marker =
      markerRef.current

    if (!marker) return

    if (isHovered && !isActive) {
      marker.openTooltip()
    } else {
      marker.closeTooltip()
    }
  }, [isHovered, isActive])

  return (
    <Marker
      ref={markerRef}
      position={[
        property.latitude!,
        property.longitude!,
      ]}
      icon={icon}
      riseOnHover
      eventHandlers={{
        popupopen: () =>
          onPopupChange(property.id),

        popupclose: () =>
          onPopupChange(null),
      }}
    >

      {/* HOVER */}

      <Tooltip
        direction="top"
        offset={[0, -8]}
        opacity={1}
        className="fyndbo-map-tooltip"
      >
        <div className="w-[210px] overflow-hidden">

          {image && (
            <img
              src={image}
              alt={property.title}
              className="h-24 w-full object-cover"
            />
          )}

          <div className="p-3">

            <p className="truncate text-sm font-semibold text-slate-900">
              {property.title}
            </p>

            <p className="mt-0.5 text-sm font-bold text-blue-600">
              {formatPrice(
                property.price
              )}
            </p>

            <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-slate-500">

              {property.area != null && (
                <span>
                  {property.area} m²
                </span>
              )}

              {property.rooms != null && (
                <span>
                  {property.rooms} rum
                </span>
              )}

              {property.city && (
                <span>
                  {property.city}
                </span>
              )}

            </div>

          </div>

        </div>
      </Tooltip>

      {/* CLICK */}

      <Popup
        className="fyndbo-map-popup"
        maxWidth={300}
        minWidth={240}
        closeButton
        autoPan
      >

        <div className="overflow-hidden">

          {image && (
            <img
              src={image}
              alt={property.title}
              className="h-32 w-full object-cover"
            />
          )}

          <div className="p-4">

            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
              {property.title}
            </h3>

            <p className="mt-1 text-base font-bold text-blue-600">
              {formatPrice(
                property.price
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {[
                property.address,
                property.city,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-slate-500">

              {property.area != null && (
                <span>
                  {property.area} m²
                </span>
              )}

              {property.rooms != null && (
                <span>
                  {property.rooms} rum
                </span>
              )}

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/bostader/${property.id}`
                )
              }
              className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              Visa bostad
            </button>

          </div>

        </div>

      </Popup>

    </Marker>
  )
}

// ============================================================
// MAP COMPONENT
// ============================================================

export default function MapComponent({
  properties,
  hoveredId,
  activePopupId,
  onPopupChange,
}: MapComponentProps) {
  const [
    borderData,
    setBorderData,
  ] = useState<any>(null)

  useEffect(() => {
    fetch('/sweden_border.geojson')
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            'GeoJSON kunde inte laddas.'
          )
        }

        return response.json()
      })
      .then(setBorderData)
      .catch((error) =>
        console.error(
          'Kunde inte ladda Sveriges gräns:',
          error
        )
      )
  }, [])

  const mappedProperties =
    useMemo(
      () =>
        properties.filter(
          (property) =>
            property.latitude != null &&
            property.longitude != null
        ),
      [properties]
    )

  return (
    <div className="relative h-full w-full">

      <style jsx global>{`
        .fyndbo-map-popup .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.28) !important;
        }

        .fyndbo-map-popup .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }

        .fyndbo-map-popup .leaflet-popup-tip {
          background: white;
        }

        .fyndbo-map-popup .leaflet-popup-close-button {
          top: 7px !important;
          right: 7px !important;
          width: 28px !important;
          height: 28px !important;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.7);
          color: white !important;
          line-height: 26px !important;
          font-size: 19px !important;
          backdrop-filter: blur(8px);
        }

        .fyndbo-map-tooltip {
          padding: 0 !important;
          border: 0 !important;
          border-radius: 14px !important;
          overflow: hidden;
          background: white !important;
          box-shadow: 0 14px 35px rgba(15, 23, 42, 0.26) !important;
        }

        .fyndbo-map-tooltip::before {
          border-top-color: white !important;
        }

        .leaflet-tooltip.fyndbo-map-tooltip {
          white-space: normal !important;
        }
      `}</style>

      <MapContainer
        center={[62.2, 16.3]}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom
        zoomControl
        attributionControl={false}
        maxBounds={[
          [54, 5],
          [71, 32],
        ]}
        maxBoundsViscosity={0.8}
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

        {borderData && (
          <GeoJSON
            data={borderData}
            interactive={false}
            style={{
              color: '#2563eb',
              weight: 2,
              opacity: 0.5,
              fillOpacity: 0,
            }}
          />
        )}

        <MapViewportController
          properties={
            mappedProperties
          }
        />

        {mappedProperties.map(
          (property) => (
            <PropertyMarker
              key={property.id}
              property={property}
              isHovered={
                hoveredId ===
                property.id
              }
              isActive={
                activePopupId ===
                property.id
              }
              onPopupChange={
                onPopupChange
              }
            />
          )
        )}

      </MapContainer>

      {mappedProperties.length ===
        0 && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500]">

          <div className="mx-auto max-w-sm rounded-xl border border-white/20 bg-slate-950/85 px-4 py-3 text-center text-xs text-slate-300 shadow-xl backdrop-blur-xl">
            Inga bostäder i sökningen har koordinater ännu.
          </div>

        </div>
      )}

    </div>
  )
}