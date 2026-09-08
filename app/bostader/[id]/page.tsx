'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// ============================================================
// KARTA
// ============================================================

const PropertyMap = dynamic(
  () => import('./PropertyMap'),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-900">

        <div className="text-center">

          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

          <p className="mt-3 text-xs text-slate-500">
            Laddar karta...
          </p>

        </div>

      </div>
    ),
  }
)

// ============================================================
// TYP
// ============================================================

interface Property {
  id: number
  title: string
  description: string | null
  price: number
  area: number | null
  rooms: number | null
  address: string | null
  city: string | null
  postal_code?: string | null
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

// ============================================================
// IKON
// ============================================================

type IconName =
  | 'back'
  | 'location'
  | 'area'
  | 'rooms'
  | 'calendar'
  | 'external'
  | 'building'
  | 'money'
  | 'check'
  | 'image'
  | 'arrowLeft'
  | 'arrowRight'

function Icon({
  name,
  className = 'h-5 w-5',
}: {
  name: IconName
  className?: string
}) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
  }

  switch (name) {
    case 'back':
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      )

    case 'location':
      return (
        <svg {...common}>
          <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )

    case 'area':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 8h8v8H8Z" />
        </svg>
      )

    case 'rooms':
      return (
        <svg {...common}>
          <path d="M4 20V7h16v13" />
          <path d="M4 14h16M9 7v7" />
        </svg>
      )

    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      )

    case 'external':
      return (
        <svg {...common}>
          <path d="M14 5h5v5" />
          <path d="m10 14 9-9" />
          <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
        </svg>
      )

    case 'building':
      return (
        <svg {...common}>
          <path d="M4 21V3h11v18M15 9h5v12" />
          <path d="M8 7h3M8 11h3M8 15h3M18 13v2M18 18v1" />
        </svg>
      )

    case 'money':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )

    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )

    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="m21 15-5-5L5 20" />
        </svg>
      )

    case 'arrowLeft':
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      )

    case 'arrowRight':
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      )

    default:
      return null
  }
}

// ============================================================
// PAGE
// ============================================================

export default function PropertyDetailPage() {
  const params = useParams()

  const id = params.id as string

  const [
    property,
    setProperty,
  ] = useState<Property | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [
    activeImage,
    setActiveImage,
  ] = useState(0)

  // ==========================================================
  // FETCH
  // ==========================================================

  useEffect(() => {
    if (!id) return

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(
          `/api/properties/${id}`,
          {
            cache: 'no-store',
          }
        )

        const data =
          await res.json()

        if (!res.ok) {
          throw new Error(
            data.error ||
              'Bostaden kunde inte hämtas.'
          )
        }

        if (!data.property) {
          throw new Error(
            'Bostaden hittades inte.'
          )
        }

        setProperty(
          data.property
        )
      } catch (err: any) {
        setError(
          err?.message ||
            'Kunde inte hämta bostaden.'
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  // ==========================================================
  // BILDER
  // ==========================================================

  const allImages = useMemo(() => {
    if (!property) return []

    const images = [
      ...(property.images || []),
    ]

    if (
      property.image_url &&
      !images.includes(
        property.image_url
      )
    ) {
      images.unshift(
        property.image_url
      )
    }

    return images.filter(Boolean)
  }, [property])

  useEffect(() => {
    if (
      activeImage >=
      allImages.length
    ) {
      setActiveImage(0)
    }
  }, [
    allImages.length,
    activeImage,
  ])

  const nextImage = () => {
    if (allImages.length <= 1)
      return

    setActiveImage(
      (current) =>
        (current + 1) %
        allImages.length
    )
  }

  const previousImage = () => {
    if (allImages.length <= 1)
      return

    setActiveImage(
      (current) =>
        (current -
          1 +
          allImages.length) %
        allImages.length
    )
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-500">
            Laddar bostad...
          </p>

        </div>

      </div>
    )
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">

        <div className="max-w-md text-center">

          <h1 className="text-xl font-semibold text-white">
            Bostaden kunde inte visas
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              'Bostaden hittades inte.'}
          </p>

          <Link
            href="/bostader"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <Icon
              name="back"
              className="h-4 w-4"
            />

            Till bostäder
          </Link>

        </div>

      </div>
    )
  }

  const location = [
    property.address,
    property.postal_code,
    property.city,
  ]
    .filter(Boolean)
    .join(', ')

  const pricePerSquareMeter =
    property.area &&
    property.area > 0
      ? Math.round(
          property.price /
            property.area
        )
      : null

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-slate-950/85 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          <Link
            href="/bostader"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <Icon
              name="back"
              className="h-4 w-4"
            />

            Bostäder
          </Link>

          <Link href="/">
            <Image
              src="/Fyndbo-blue-bkg.png"
              alt="FyndBo"
              width={100}
              height={60}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <div className="w-[76px]" />

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">

        {/* ====================================================
            GALLERI
        ==================================================== */}

        {allImages.length > 0 ? (
          <section>

            <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-900 sm:aspect-[16/8]">

              <img
                src={
                  allImages[
                    activeImage
                  ]
                }
                alt={`${property.title} – bild ${
                  activeImage + 1
                }`}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

              {allImages.length >
                1 && (
                <>
                  <button
                    onClick={
                      previousImage
                    }
                    aria-label="Föregående bild"
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/65 text-white backdrop-blur transition hover:bg-slate-950/85 sm:left-5"
                  >
                    <Icon
                      name="arrowLeft"
                      className="h-5 w-5"
                    />
                  </button>

                  <button
                    onClick={
                      nextImage
                    }
                    aria-label="Nästa bild"
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/65 text-white backdrop-blur transition hover:bg-slate-950/85 sm:right-5"
                  >
                    <Icon
                      name="arrowRight"
                      className="h-5 w-5"
                    />
                  </button>

                  <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                    {activeImage + 1} /{' '}
                    {allImages.length}
                  </div>
                </>
              )}

            </div>

            {allImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">

                {allImages.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() =>
                        setActiveImage(
                          index
                        )
                      }
                      className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-36 ${
                        activeImage ===
                        index
                          ? 'border-blue-500 opacity-100'
                          : 'border-transparent opacity-55 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Miniatyr ${
                          index + 1
                        }`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </section>
        ) : (
          <div className="flex aspect-[16/7] items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-slate-700">

            <div className="text-center">

              <Icon
                name="image"
                className="mx-auto h-9 w-9"
              />

              <p className="mt-2 text-xs">
                Inga bilder
              </p>

            </div>

          </div>
        )}

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_370px]">

          {/* LEFT */}

          <div className="min-w-0 space-y-8">

            {/* INTRO */}

            <section>

              {property.property_type && (
                <span className="inline-flex rounded-full border border-blue-500/15 bg-blue-500/10 px-3 py-1 text-xs font-medium capitalize text-blue-300">
                  {propertyTypeLabel(
                    property.property_type
                  )}
                </span>
              )}

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {property.title}
              </h1>

              {location && (
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">

                  <Icon
                    name="location"
                    className="h-4 w-4 shrink-0"
                  />

                  {location}

                </p>
              )}

              <p className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {formatPrice(
                  property.price
                )}
              </p>

              {pricePerSquareMeter && (
                <p className="mt-1 text-sm text-slate-500">
                  {pricePerSquareMeter.toLocaleString(
                    'sv-SE'
                  )}{' '}
                  kr/m²
                </p>
              )}

            </section>

            {/* SNABBFAKTA */}

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              {property.area != null && (
                <QuickFact
                  icon="area"
                  label="Boarea"
                  value={`${property.area} m²`}
                />
              )}

              {property.rooms != null && (
                <QuickFact
                  icon="rooms"
                  label="Rum"
                  value={`${property.rooms}`}
                />
              )}

              {property.construction_year !=
                null && (
                <QuickFact
                  icon="calendar"
                  label="Byggår"
                  value={String(
                    property.construction_year
                  )}
                />
              )}

              {property.floor && (
                <QuickFact
                  icon="building"
                  label="Våning"
                  value={property.floor}
                />
              )}

            </section>

            {/* BESKRIVNING */}

            {property.description && (
              <section className="border-t border-white/[0.07] pt-7">

                <h2 className="text-xl font-semibold">
                  Om bostaden
                </h2>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-400 sm:text-base">
                  {property.description}
                </p>

              </section>
            )}

            {/* ALLA FAKTA */}

            <section className="border-t border-white/[0.07] pt-7">

              <h2 className="text-xl font-semibold">
                Fakta
              </h2>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07]">

                <FactRow
                  label="Pris"
                  value={formatPrice(
                    property.price
                  )}
                />

                <FactRow
                  label="Boarea"
                  value={
                    property.area != null
                      ? `${property.area} m²`
                      : '—'
                  }
                />

                <FactRow
                  label="Antal rum"
                  value={
                    property.rooms != null
                      ? `${property.rooms} rum`
                      : '—'
                  }
                />

                {property.monthly_fee !=
                  null && (
                  <FactRow
                    label="Månadsavgift"
                    value={`${property.monthly_fee.toLocaleString(
                      'sv-SE'
                    )} kr/mån`}
                  />
                )}

                {property.operating_cost !=
                  null && (
                  <FactRow
                    label="Driftkostnad"
                    value={`${property.operating_cost.toLocaleString(
                      'sv-SE'
                    )} kr/år`}
                  />
                )}

                {property.plot_area !=
                  null && (
                  <FactRow
                    label="Tomtarea"
                    value={`${property.plot_area.toLocaleString(
                      'sv-SE'
                    )} m²`}
                  />
                )}

                {property.floor && (
                  <FactRow
                    label="Våning"
                    value={
                      property.floor
                    }
                  />
                )}

                <FactRow
                  label="Hiss"
                  value={
                    property.elevator
                      ? 'Ja'
                      : 'Nej'
                  }
                />

                <FactRow
                  label="Balkong"
                  value={
                    property.balcony
                      ? 'Ja'
                      : 'Nej'
                  }
                />

                {property.construction_year !=
                  null && (
                  <FactRow
                    label="Byggår"
                    value={String(
                      property.construction_year
                    )}
                  />
                )}

                {property.energy_class && (
                  <FactRow
                    label="Energiklass"
                    value={property.energy_class.toUpperCase()}
                  />
                )}

                {property.association && (
                  <FactRow
                    label="Förening"
                    value={
                      property.association
                    }
                  />
                )}

              </div>

            </section>

          </div>

          {/* RIGHT */}

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* CTA */}

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">

              <p className="text-xs uppercase tracking-wider text-slate-600">
                Pris
              </p>

              <p className="mt-1 text-2xl font-bold">
                {formatPrice(
                  property.price
                )}
              </p>

              {property.listing_url ? (
                <a
                  href={
                    property.listing_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
                >
                  Gå till annonsen

                  <Icon
                    name="external"
                    className="h-4 w-4"
                  />
                </a>
              ) : (
                <div className="mt-5 rounded-xl bg-white/[0.035] px-4 py-3 text-center text-xs text-slate-500">
                  Ingen extern annonslänk tillgänglig.
                </div>
              )}

              {property.listing_url && (
                <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-600">
                  Länken öppnar bostadens ursprungliga annons i en ny flik.
                </p>
              )}

            </div>

            {/* MAP */}

            {property.latitude != null &&
              property.longitude !=
                null && (
                <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900">

                  <div className="h-72">

                    <PropertyMap
                      latitude={
                        property.latitude
                      }
                      longitude={
                        property.longitude
                      }
                      title={
                        property.title
                      }
                      address={
                        location
                      }
                    />

                  </div>

                </div>
              )}

            {/* LOCATION */}

            {location && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                    <Icon
                      name="location"
                      className="h-4 w-4"
                    />

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wide text-slate-600">
                      Adress
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-slate-300">
                      {location}
                    </p>

                  </div>

                </div>

              </div>
            )}

          </aside>

        </div>

      </main>

      {/* FOOTER */}

      <footer className="mt-12 border-t border-white/[0.06]">

        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-slate-600 sm:px-6">
          © 2026 FyndBo.se – En plattform för bostadssökande
        </div>

      </footer>

    </div>
  )
}

// ============================================================
// QUICK FACT
// ============================================================

function QuickFact({
  icon,
  label,
  value,
}: {
  icon: IconName
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">

      <Icon
        name={icon}
        className="h-4 w-4 text-blue-400"
      />

      <p className="mt-3 text-[10px] uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>

    </div>
  )
}

// ============================================================
// FACT ROW
// ============================================================

function FactRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-white/[0.06] bg-white/[0.025] px-4 py-3.5 last:border-b-0 sm:px-5">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-200">
        {value}
      </span>

    </div>
  )
}

// ============================================================
// HELPERS
// ============================================================

function formatPrice(price: number) {
  return (
    new Intl.NumberFormat(
      'sv-SE'
    ).format(price) + ' kr'
  )
}

function propertyTypeLabel(
  value: string
) {
  const labels: Record<
    string,
    string
  > = {
    villa: 'Villa',
    lägenhet: 'Lägenhet',
    radhus: 'Radhus',
    fritidshus: 'Fritidshus',
    tomt: 'Tomt',
    gård: 'Gård / Skog',
  }

  return labels[value] || value
}