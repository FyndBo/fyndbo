'use client'

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// ============================================================
// TYPER
// ============================================================

interface Property {
  id: number
  title: string
  description?: string | null
  price: number
  area: number | null
  rooms: number | null
  city: string | null
  address: string | null
  postal_code?: string | null
  image_url: string | null
  latitude: number | null
  longitude: number | null
  monthly_fee: number | null
  operating_cost?: number | null
  floor: string | null
  elevator: boolean | null
  balcony: boolean | null
  images: string[]
  property_type: string | null
  energy_class: string | null
  construction_year?: number | null
  created_at?: string
}

interface Filters {
  city: string
  propertyType: string
  minRooms: string
  minPrice: string
  maxPrice: string
}

type SortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'area-desc'

// ============================================================
// KARTA
// ============================================================

const MapComponent = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-full min-h-[350px] w-full items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

          <p className="mt-3 text-xs text-slate-500">
            Laddar karta...
          </p>
        </div>
      </div>
    ),
  }
)

// ============================================================
// ALTERNATIV
// ============================================================

const PROPERTY_TYPES = [
  { value: '', label: 'Alla bostadstyper' },
  { value: 'villa', label: 'Villa' },
  { value: 'lägenhet', label: 'Lägenhet' },
  { value: 'radhus', label: 'Radhus' },
  { value: 'fritidshus', label: 'Fritidshus' },
  { value: 'tomt', label: 'Tomt' },
  { value: 'gård', label: 'Gård / Skog' },
]

const ROOM_OPTIONS = [
  { value: '', label: 'Alla antal rum' },
  { value: '1', label: 'Minst 1 rum' },
  { value: '2', label: 'Minst 2 rum' },
  { value: '3', label: 'Minst 3 rum' },
  { value: '4', label: 'Minst 4 rum' },
  { value: '5', label: 'Minst 5 rum' },
]

// ============================================================
// IKONER
// ============================================================

type IconName =
  | 'search'
  | 'filter'
  | 'map'
  | 'list'
  | 'home'
  | 'user'
  | 'location'
  | 'area'
  | 'rooms'
  | 'close'
  | 'arrow'
  | 'reset'

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
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      )

    case 'filter':
      return (
        <svg {...common}>
          <path d="M4 5h16M7 12h10M10 19h4" />
        </svg>
      )

    case 'map':
      return (
        <svg {...common}>
          <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
      )

    case 'list':
      return (
        <svg {...common}>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
      )

    case 'home':
      return (
        <svg {...common}>
          <path d="m3 11 9-7 9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      )

    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
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

    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      )

    case 'arrow':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m14 7 5 5-5 5" />
        </svg>
      )

    case 'reset':
      return (
        <svg {...common}>
          <path d="M4 4v6h6" />
          <path d="M5 15a8 8 0 1 0 1-8l-2 3" />
        </svg>
      )

    default:
      return null
  }
}

// ============================================================
// PROPERTY CARD
// ============================================================

function PropertyCard({
  property,
  hovered,
  onMouseEnter,
  onMouseLeave,
}: {
  property: Property
  hovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const image =
    property.images?.[0] ||
    property.image_url

  return (
    <Link
      href={`/bostader/${property.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group block overflow-hidden rounded-2xl border bg-white/[0.035] transition-all duration-300 ${
        hovered
          ? 'border-blue-500/40 bg-blue-500/[0.05] shadow-xl shadow-blue-500/5'
          : 'border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06]'
      }`}
    >
      <div className="flex flex-col sm:flex-row">

        {/* BILD */}

        <div className="relative h-52 shrink-0 overflow-hidden bg-slate-900 sm:h-auto sm:w-[230px]">

          {image ? (
            <img
              src={image}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full min-h-40 items-center justify-center text-slate-700">
              <Icon
                name="home"
                className="h-9 w-9"
              />
            </div>
          )}

          {property.property_type && (
            <span className="absolute left-3 top-3 rounded-lg bg-slate-950/75 px-2.5 py-1 text-[10px] font-medium capitalize text-white backdrop-blur">
              {propertyTypeLabel(
                property.property_type
              )}
            </span>
          )}

        </div>

        {/* INFO */}

        <div className="min-w-0 flex-1 p-4 sm:p-5">

          <div className="flex h-full flex-col">

            <div className="flex-1">

              <h2 className="truncate text-base font-semibold text-white transition group-hover:text-blue-300 sm:text-lg">
                {property.title}
              </h2>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">

                <Icon
                  name="location"
                  className="h-3.5 w-3.5 shrink-0"
                />

                <span className="truncate">
                  {[
                    property.address,
                    property.city,
                  ]
                    .filter(Boolean)
                    .join(', ') ||
                    'Adress saknas'}
                </span>

              </div>

              <p className="mt-4 text-xl font-bold tracking-tight text-white">
                {formatPrice(property.price)}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">

                {property.area != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon
                      name="area"
                      className="h-3.5 w-3.5"
                    />

                    {property.area} m²
                  </span>
                )}

                {property.rooms != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon
                      name="rooms"
                      className="h-3.5 w-3.5"
                    />

                    {property.rooms} rum
                  </span>
                )}

                {property.monthly_fee != null &&
                  property.monthly_fee > 0 && (
                    <span>
                      Avgift{' '}
                      {property.monthly_fee.toLocaleString(
                        'sv-SE'
                      )}{' '}
                      kr/mån
                    </span>
                  )}

              </div>

            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-3">

              <span className="text-[11px] text-slate-600">
                {property.area
                  ? `${Math.round(
                      property.price /
                        property.area
                    ).toLocaleString(
                      'sv-SE'
                    )} kr/m²`
                  : 'FyndBo'}
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 transition group-hover:text-blue-300">
                Visa bostad

                <Icon
                  name="arrow"
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                />
              </span>

            </div>

          </div>
        </div>

      </div>
    </Link>
  )
}

// ============================================================
// HEADER
// ============================================================

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-slate-950/85 backdrop-blur-xl">

      <div className="mx-auto flex h-16 max-w-[1700px] items-center justify-between px-4 sm:px-6">

        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <Image
            src="/Fyndbo-blue-bkg.png"
            alt="FyndBo"
            width={120}
            height={70}
            className="h-9 w-auto"
            priority
          />

          <span className="hidden font-bold tracking-tight text-white sm:block">
            FyndBo
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">

          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Startsida
          </Link>

          <Link
            href="/bostader"
            className="text-sm font-medium text-white"
          >
            Bostäder
          </Link>

          <Link
            href="/om"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Om oss
          </Link>

        </nav>

        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
        >
          <Icon
            name="user"
            className="h-4 w-4"
          />

          <span className="hidden sm:inline">
            Logga in
          </span>
        </Link>

      </div>

    </header>
  )
}

// ============================================================
// HUVUDINNEHÅLL
// ============================================================

function BostaderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [properties, setProperties] =
    useState<Property[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [hoveredId, setHoveredId] =
    useState<number | null>(null)

  const [
    activePopupId,
    setActivePopupId,
  ] = useState<number | null>(null)

  const [showFilters, setShowFilters] =
    useState(false)

  const [showMap, setShowMap] =
    useState(true)

  const [sort, setSort] =
    useState<SortOption>('newest')

  const [city, setCity] = useState(
    searchParams.get('city') || ''
  )

  const [
    propertyType,
    setPropertyType,
  ] = useState(
    searchParams.get('property_type') ||
      ''
  )

  const [minRooms, setMinRooms] =
    useState(
      searchParams.get('minRooms') || ''
    )

  const [minPrice, setMinPrice] =
    useState(
      searchParams.get('minPrice') || ''
    )

  const [maxPrice, setMaxPrice] =
    useState(
      searchParams.get('maxPrice') || ''
    )

  // ==========================================================
  // HÄMTA
  // ==========================================================

  const fetchProperties = async (
    filters?: Partial<Filters>
  ) => {
    const nextFilters: Filters = {
      city:
        filters?.city !== undefined
          ? filters.city
          : city,

      propertyType:
        filters?.propertyType !==
        undefined
          ? filters.propertyType
          : propertyType,

      minRooms:
        filters?.minRooms !== undefined
          ? filters.minRooms
          : minRooms,

      minPrice:
        filters?.minPrice !== undefined
          ? filters.minPrice
          : minPrice,

      maxPrice:
        filters?.maxPrice !== undefined
          ? filters.maxPrice
          : maxPrice,
    }

    setLoading(true)
    setError('')

    const params = new URLSearchParams()

    if (nextFilters.city.trim()) {
      params.set(
        'city',
        nextFilters.city.trim()
      )
    }

    if (nextFilters.propertyType) {
      params.set(
        'property_type',
        nextFilters.propertyType
      )
    }

    if (nextFilters.minRooms) {
      params.set(
        'minRooms',
        nextFilters.minRooms
      )
    }

    if (nextFilters.minPrice) {
      params.set(
        'minPrice',
        nextFilters.minPrice
      )
    }

    if (nextFilters.maxPrice) {
      params.set(
        'maxPrice',
        nextFilters.maxPrice
      )
    }

    try {
      const query = params.toString()

      const res = await fetch(
        `/api/properties${
          query ? `?${query}` : ''
        }`,
        {
          cache: 'no-store',
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.error ||
            'Kunde inte hämta bostäder.'
        )
      }

      setProperties(
        data.properties || []
      )

      router.replace(
        `/bostader${
          query ? `?${query}` : ''
        }`,
        {
          scroll: false,
        }
      )
    } catch (err: any) {
      setError(
        err?.message ||
          'Kunde inte hämta bostäder.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
    // Kör endast initialt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ==========================================================
  // SORTERING
  // ==========================================================

  const sortedProperties = useMemo(() => {
    const result = [...properties]

    switch (sort) {
      case 'price-asc':
        return result.sort(
          (a, b) => a.price - b.price
        )

      case 'price-desc':
        return result.sort(
          (a, b) => b.price - a.price
        )

      case 'area-desc':
        return result.sort(
          (a, b) =>
            (b.area || 0) -
            (a.area || 0)
        )

      case 'newest':
      default:
        return result.sort((a, b) => {
          const aDate = a.created_at
            ? new Date(
                a.created_at
              ).getTime()
            : 0

          const bDate = b.created_at
            ? new Date(
                b.created_at
              ).getTime()
            : 0

          return bDate - aDate
        })
    }
  }, [properties, sort])

  // ==========================================================
  // SÖK
  // ==========================================================

  const handleSearch = (
    e?: FormEvent
  ) => {
    e?.preventDefault()
    fetchProperties()
  }

  const resetFilters = () => {
    setCity('')
    setPropertyType('')
    setMinRooms('')
    setMinPrice('')
    setMaxPrice('')

    fetchProperties({
      city: '',
      propertyType: '',
      minRooms: '',
      minPrice: '',
      maxPrice: '',
    })
  }

  const hasFilters =
    Boolean(city.trim()) ||
    Boolean(propertyType) ||
    Boolean(minRooms) ||
    Boolean(minPrice) ||
    Boolean(maxPrice)

  const coordinateCount =
    properties.filter(
      (property) =>
        property.latitude != null &&
        property.longitude != null
    ).length

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Header />

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <section className="border-b border-white/[0.06] bg-slate-950">

        <div className="mx-auto max-w-[1700px] px-4 py-5 sm:px-6">

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 lg:flex-row"
          >

            <div className="relative flex-1">

              <Icon
                name="search"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600"
              />

              <input
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                placeholder="Sök efter stad eller område..."
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/10"
              />

            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                  showFilters ||
                  hasFilters
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                    : 'border-white/[0.08] bg-white/[0.04] text-slate-400 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <Icon
                  name="filter"
                  className="h-4 w-4"
                />

                Filter

                {hasFilters && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                )}
              </button>

              <button
                type="submit"
                className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
              >
                Sök
              </button>

            </div>

          </form>

          {/* FILTER */}

          {showFilters && (
            <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

                <select
                  value={propertyType}
                  onChange={(e) =>
                    setPropertyType(
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-white/[0.08] bg-slate-900 px-3 text-sm text-slate-300 outline-none focus:border-blue-500/30"
                >
                  {PROPERTY_TYPES.map(
                    (type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={minRooms}
                  onChange={(e) =>
                    setMinRooms(
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-white/[0.08] bg-slate-900 px-3 text-sm text-slate-300 outline-none focus:border-blue-500/30"
                >
                  {ROOM_OPTIONS.map(
                    (room) => (
                      <option
                        key={room.value}
                        value={room.value}
                      >
                        {room.label}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(
                      e.target.value
                    )
                  }
                  placeholder="Minpris"
                  className="h-11 rounded-xl border border-white/[0.08] bg-slate-900 px-3 text-sm text-slate-300 outline-none placeholder:text-slate-600 focus:border-blue-500/30"
                />

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(
                      e.target.value
                    )
                  }
                  placeholder="Maxpris"
                  className="h-11 rounded-xl border border-white/[0.08] bg-slate-900 px-3 text-sm text-slate-300 outline-none placeholder:text-slate-600 focus:border-blue-500/30"
                />

                <div className="flex gap-2">

                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    Uppdatera
                  </button>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      title="Rensa filter"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-500 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <Icon
                        name="reset"
                        className="h-4 w-4"
                      />
                    </button>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>

      </section>

      {/* ======================================================
          RESULT TOOLBAR
      ====================================================== */}

      <section className="border-b border-white/[0.05] bg-slate-950">

        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">

          <div>
            <p className="text-sm font-semibold text-white">
              {loading
                ? 'Söker...'
                : `${properties.length} ${
                    properties.length === 1
                      ? 'bostad'
                      : 'bostäder'
                  }`}
            </p>

            {!loading &&
              coordinateCount <
                properties.length && (
                <p className="mt-0.5 text-[10px] text-slate-600">
                  {coordinateCount} visas på kartan
                </p>
              )}
          </div>

          <div className="flex items-center gap-2">

            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target
                    .value as SortOption
                )
              }
              className="h-9 rounded-lg border border-white/[0.08] bg-slate-900 px-3 text-xs text-slate-400 outline-none"
            >
              <option value="newest">
                Nyast först
              </option>

              <option value="price-asc">
                Lägst pris
              </option>

              <option value="price-desc">
                Högst pris
              </option>

              <option value="area-desc">
                Störst boarea
              </option>
            </select>

            <button
              onClick={() =>
                setShowMap(!showMap)
              }
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition ${
                showMap
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                  : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:text-white'
              }`}
            >
              <Icon
                name={
                  showMap ? 'list' : 'map'
                }
                className="h-4 w-4"
              />

              {showMap
                ? 'Dölj karta'
                : 'Visa karta'}
            </button>

          </div>

        </div>

      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-[1700px] px-3 py-3 sm:px-6 sm:py-5">

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div
          className={`grid gap-4 ${
            showMap
              ? 'lg:grid-cols-[minmax(0,1.35fr)_minmax(390px,0.85fr)]'
              : 'grid-cols-1'
          }`}
        >

          {/* LIST */}

          <div className="min-w-0">

            {loading ? (
              <LoadingList />
            ) : sortedProperties.length ===
              0 ? (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] px-6 text-center">

                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-700">
                    <Icon
                      name="home"
                      className="h-6 w-6"
                    />
                  </div>

                  <h2 className="mt-4 font-semibold text-slate-300">
                    Inga bostäder hittades
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Prova att ändra din sökning eller rensa filtren.
                  </p>

                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                      Rensa filter
                    </button>
                  )}

                </div>

              </div>
            ) : (
              <div
                className={`grid gap-3 ${
                  showMap
                    ? 'grid-cols-1'
                    : 'xl:grid-cols-2'
                }`}
              >

                {sortedProperties.map(
                  (property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      hovered={
                        hoveredId ===
                        property.id ||
                        activePopupId ===
                          property.id
                      }
                      onMouseEnter={() =>
                        setHoveredId(
                          property.id
                        )
                      }
                      onMouseLeave={() =>
                        setHoveredId(null)
                      }
                    />
                  )
                )}

              </div>
            )}

          </div>

          {/* MAP */}

          {showMap && (
            <div className="order-first h-[380px] overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900 shadow-xl lg:order-none lg:sticky lg:top-[145px] lg:h-[calc(100vh-170px)]">

              <MapComponent
                properties={
                  sortedProperties
                }
                hoveredId={hoveredId}
                activePopupId={
                  activePopupId
                }
                onPopupChange={
                  setActivePopupId
                }
              />

            </div>
          )}

        </div>

      </main>

    </div>
  )
}

// ============================================================
// LOADING
// ============================================================

function LoadingList() {
  return (
    <div className="space-y-3">

      {[1, 2, 3, 4].map(
        (number) => (
          <div
            key={number}
            className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025]"
          >
            <div className="flex flex-col sm:flex-row">

              <div className="h-48 animate-pulse bg-white/[0.04] sm:h-48 sm:w-[230px]" />

              <div className="flex-1 p-5">

                <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.05]" />

                <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />

                <div className="mt-6 h-6 w-1/3 animate-pulse rounded bg-white/[0.05]" />

              </div>

            </div>
          </div>
        )
      )}

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
  return (
    PROPERTY_TYPES.find(
      (type) => type.value === value
    )?.label || value
  )
}

// ============================================================
// EXPORT
// ============================================================

export default function BostaderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-500">
              Laddar bostäder...
            </p>

          </div>

        </div>
      }
    >
      <BostaderContent />
    </Suspense>
  )
}