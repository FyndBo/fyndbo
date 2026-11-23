'use client'

import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

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

type FilterKey = keyof Filters

type SortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'area-desc'

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
  | 'chevron'
  | 'building'
  | 'calendar'
  | 'wallet'
  | 'check'
  | 'warning'

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[320px] items-center justify-center bg-slate-900/80"
      aria-label="Laddar karta"
      role="status"
    >
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-blue-400/20 border-t-blue-400" />
        <p className="mt-3 text-sm text-slate-400">
          Laddar kartan…
        </p>
      </div>
    </div>
  ),
})

const PROPERTY_TYPES = [
  { value: '', label: 'Alla bostadstyper' },
  { value: 'villa', label: 'Villa' },
  { value: 'lägenhet', label: 'Lägenhet' },
  { value: 'radhus', label: 'Radhus' },
  { value: 'fritidshus', label: 'Fritidshus' },
  { value: 'tomt', label: 'Tomt' },
  { value: 'gård', label: 'Gård / skog' },
]

const ROOM_OPTIONS = [
  { value: '', label: 'Alla antal rum' },
  { value: '1', label: 'Minst 1 rum' },
  { value: '2', label: 'Minst 2 rum' },
  { value: '3', label: 'Minst 3 rum' },
  { value: '4', label: 'Minst 4 rum' },
  { value: '5', label: 'Minst 5 rum' },
]

const SORT_OPTIONS: {
  value: SortOption
  label: string
}[] = [
  { value: 'newest', label: 'Nyast först' },
  { value: 'price-asc', label: 'Lägst pris' },
  { value: 'price-desc', label: 'Högst pris' },
  { value: 'area-desc', label: 'Störst boarea' },
]

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
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    focusable: false as const,
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
          <circle
            cx="3"
            cy="6"
            r="1"
            fill="currentColor"
            stroke="none"
          />
          <circle
            cx="3"
            cy="12"
            r="1"
            fill="currentColor"
            stroke="none"
          />
          <circle
            cx="3"
            cy="18"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      )

    case 'home':
      return (
        <svg {...common}>
          <path d="m3 11 9-7 9 7" />
          <path d="M5 10v10h14V10M9 20v-6h6v6" />
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
          <path d="M4 20V7h16v13M4 14h16M9 7v7" />
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
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )

    case 'reset':
      return (
        <svg {...common}>
          <path d="M4 4v6h6" />
          <path d="M5 15a8 8 0 1 0 1-8L4 10" />
        </svg>
      )

    case 'chevron':
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      )

    case 'building':
      return (
        <svg {...common}>
          <rect
            x="4"
            y="3"
            width="16"
            height="18"
            rx="1.5"
          />
          <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
        </svg>
      )

    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      )

    case 'wallet':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <path d="M3 9h18M16 14h.01" />
        </svg>
      )

    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )

    case 'warning':
      return (
        <svg {...common}>
          <path d="M12 3 2.8 19a1.4 1.4 0 0 0 1.2 2h16a1.4 1.4 0 0 0 1.2-2L12 3Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      )

    default:
      return null
  }
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('sv-SE').format(price)} kr`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('sv-SE').format(value)
}

function propertyTypeLabel(value: string | null) {
  if (!value) return 'Bostad'

  return (
    PROPERTY_TYPES.find(
      (type) =>
        type.value.toLocaleLowerCase('sv-SE') ===
        value.toLocaleLowerCase('sv-SE')
    )?.label ?? value
  )
}

function makeQuery(filters: Filters) {
  const params = new URLSearchParams()

  if (filters.city.trim()) {
    params.set('city', filters.city.trim())
  }

  if (filters.propertyType) {
    params.set('property_type', filters.propertyType)
  }

  if (filters.minRooms) {
    params.set('minRooms', filters.minRooms)
  }

  if (filters.minPrice) {
    params.set('minPrice', filters.minPrice)
  }

  if (filters.maxPrice) {
    params.set('maxPrice', filters.maxPrice)
  }

  return params.toString()
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-slate-950/90 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-blue-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        Hoppa till innehållet
      </a>

      <div className="mx-auto flex h-[68px] max-w-[1700px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="FyndBo – till startsidan"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Image
            src="/Fyndbo-blue-bkg.png"
            alt=""
            width={120}
            height={70}
            priority
            className="h-9 w-auto object-contain"
          />

          <span className="hidden text-lg font-bold tracking-tight text-white sm:block">
            FyndBo
          </span>
        </Link>

        <nav
          aria-label="Huvudmeny"
          className="hidden items-center gap-7 md:flex"
        >
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Startsida
          </Link>

          <Link
            href="/bostader"
            aria-current="page"
            className="text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Bostäder
          </Link>

          <Link
            href="/om"
            className="text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Om oss
          </Link>
        </nav>

        <Link
          href="/admin/login"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Icon name="user" className="h-4 w-4" />
          <span>Logga in</span>
        </Link>
      </div>

      <nav
        aria-label="Mobilmeny"
        className="flex items-center gap-6 overflow-x-auto border-t border-white/[0.06] px-4 py-2.5 md:hidden"
      >
        <Link
          href="/"
          className="whitespace-nowrap text-xs text-slate-400 hover:text-white"
        >
          Startsida
        </Link>

        <Link
          href="/bostader"
          aria-current="page"
          className="whitespace-nowrap text-xs font-semibold text-blue-300"
        >
          Bostäder
        </Link>

        <Link
          href="/om"
          className="whitespace-nowrap text-xs text-slate-400 hover:text-white"
        >
          Om oss
        </Link>
      </nav>
    </header>
  )
}

function PropertyCard({
  property,
  highlighted,
  onMouseEnter,
  onMouseLeave,
}: {
  property: Property
  highlighted: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const image = property.images?.[0] || property.image_url

  const location = [property.address, property.city]
    .filter(Boolean)
    .join(', ')

  const pricePerSquareMetre =
    property.area && property.area > 0
      ? Math.round(property.price / property.area)
      : null

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group min-w-0 overflow-hidden rounded-2xl border transition duration-200 ${
        highlighted
          ? 'border-blue-400/50 bg-blue-500/[0.07] shadow-lg shadow-blue-950/30'
          : 'border-white/[0.08] bg-white/[0.035] hover:border-white/[0.16] hover:bg-white/[0.055]'
      }`}
    >
      <Link
        href={`/bostader/${property.id}`}
        aria-label={`Visa ${property.title}, ${formatPrice(property.price)}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
      >
        <div className="flex min-w-0 flex-col sm:flex-row">
          <div className="relative h-52 shrink-0 overflow-hidden bg-slate-900 sm:h-auto sm:min-h-[220px] sm:w-[220px] lg:w-[240px]">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={`Bild på ${property.title}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
              />
            ) : (
              <div
                className="flex h-full min-h-44 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-600"
                aria-label="Ingen bild tillgänglig"
              >
                <Icon name="home" className="h-10 w-10" />
              </div>
            )}

            <span className="absolute left-3 top-3 rounded-lg border border-white/10 bg-slate-950/85 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
              {propertyTypeLabel(property.property_type)}
            </span>

            {property.energy_class && (
              <span className="absolute bottom-3 left-3 rounded-md bg-emerald-400 px-2 py-1 text-[10px] font-bold text-emerald-950">
                Energiklass {property.energy_class}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
            <div className="flex-1">
              <h2 className="line-clamp-2 text-base font-semibold leading-snug text-white transition group-hover:text-blue-200 sm:text-lg">
                {property.title}
              </h2>

              <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-slate-400">
                <Icon
                  name="location"
                  className="h-3.5 w-3.5 shrink-0 text-slate-500"
                />

                <span className="truncate">
                  {location || 'Adress saknas'}
                </span>
              </p>

              <p className="mt-4 text-2xl font-bold tracking-tight text-white">
                {formatPrice(property.price)}
              </p>

              <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-300">
                {property.area != null && (
                  <div className="inline-flex items-center gap-1.5">
                    <Icon
                      name="area"
                      className="h-4 w-4 text-slate-500"
                    />
                    <dt className="sr-only">Boarea</dt>
                    <dd>{property.area} m²</dd>
                  </div>
                )}

                {property.rooms != null && (
                  <div className="inline-flex items-center gap-1.5">
                    <Icon
                      name="rooms"
                      className="h-4 w-4 text-slate-500"
                    />
                    <dt className="sr-only">Antal rum</dt>
                    <dd>{property.rooms} rum</dd>
                  </div>
                )}

                {property.monthly_fee != null &&
                  property.monthly_fee > 0 && (
                    <div className="inline-flex items-center gap-1.5">
                      <Icon
                        name="wallet"
                        className="h-4 w-4 text-slate-500"
                      />
                      <dt className="sr-only">Månadsavgift</dt>
                      <dd>
                        {formatNumber(property.monthly_fee)} kr/mån
                      </dd>
                    </div>
                  )}

                {property.operating_cost != null &&
                  property.operating_cost > 0 && (
                    <div className="inline-flex items-center gap-1.5">
                      <dt className="sr-only">Driftskostnad</dt>
                      <dd>
                        Drift {formatNumber(property.operating_cost)} kr/år
                      </dd>
                    </div>
                  )}

                {property.floor && (
                  <div>
                    <dt className="sr-only">Våning</dt>
                    <dd>Våning {property.floor}</dd>
                  </div>
                )}

                {property.construction_year && (
                  <div className="inline-flex items-center gap-1.5">
                    <Icon
                      name="calendar"
                      className="h-3.5 w-3.5 text-slate-500"
                    />
                    <dt className="sr-only">Byggår</dt>
                    <dd>Byggår {property.construction_year}</dd>
                  </div>
                )}
              </dl>

              {(property.balcony || property.elevator) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.balcony && (
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] text-slate-400">
                      Balkong
                    </span>
                  )}

                  {property.elevator && (
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] text-slate-400">
                      Hiss
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
              <span className="text-[11px] text-slate-500">
                {pricePerSquareMetre
                  ? `${formatNumber(pricePerSquareMetre)} kr/m²`
                  : 'FyndBo'}
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 transition group-hover:text-blue-200">
                Visa bostad
                <Icon
                  name="arrow"
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Ta bort filtret ${label}`}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3 py-1 text-xs text-blue-200 transition hover:border-blue-300/40 hover:bg-blue-400/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <span>{label}</span>
      <Icon name="close" className="h-3.5 w-3.5" />
    </button>
  )
}

function LoadingList() {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-label="Laddar bostäder"
    >
      <span className="sr-only">Laddar bostäder…</span>

      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          aria-hidden="true"
          className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] sm:flex-row"
        >
          <div className="h-48 bg-white/[0.05] sm:w-[230px]" />

          <div className="flex-1 space-y-4 p-5">
            <div className="h-5 w-2/3 rounded bg-white/[0.06]" />
            <div className="h-3 w-1/2 rounded bg-white/[0.05]" />
            <div className="h-7 w-1/3 rounded bg-white/[0.06]" />
            <div className="h-3 w-2/5 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function BostaderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestController = useRef<AbortController | null>(null)

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [activePopupId, setActivePopupId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showMap, setShowMap] = useState(true)
  const [sort, setSort] = useState<SortOption>('newest')

  const [city, setCity] = useState(searchParams.get('city') || '')
  const [propertyType, setPropertyType] = useState(
    searchParams.get('property_type') || ''
  )
  const [minRooms, setMinRooms] = useState(
    searchParams.get('minRooms') || ''
  )
  const [minPrice, setMinPrice] = useState(
    searchParams.get('minPrice') || ''
  )
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get('maxPrice') || ''
  )

  const currentFilters: Filters = {
    city,
    propertyType,
    minRooms,
    minPrice,
    maxPrice,
  }

  const hasFilters = Boolean(
    city.trim() || propertyType || minRooms || minPrice || maxPrice
  )

  const activeFilterCount = [
    city.trim(),
    propertyType,
    minRooms,
    minPrice,
    maxPrice,
  ].filter(Boolean).length

  const fetchProperties = useCallback(
    async (overrides?: Partial<Filters>) => {
      const filters: Filters = {
        city: overrides?.city !== undefined ? overrides.city : city,
        propertyType:
          overrides?.propertyType !== undefined
            ? overrides.propertyType
            : propertyType,
        minRooms:
          overrides?.minRooms !== undefined
            ? overrides.minRooms
            : minRooms,
        minPrice:
          overrides?.minPrice !== undefined
            ? overrides.minPrice
            : minPrice,
        maxPrice:
          overrides?.maxPrice !== undefined
            ? overrides.maxPrice
            : maxPrice,
      }

      const query = makeQuery(filters)

      requestController.current?.abort()

      const controller = new AbortController()
      requestController.current = controller

      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `/api/properties${query ? `?${query}` : ''}`,
          {
            cache: 'no-store',
            signal: controller.signal,
          }
        )

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(
            data.error || 'Kunde inte hämta bostäder. Försök igen.'
          )
        }

        setProperties(
          Array.isArray(data.properties) ? data.properties : []
        )

        router.replace(
          `/bostader${query ? `?${query}` : ''}`,
          { scroll: false }
        )
      } catch (requestError) {
        if (
          requestError instanceof Error &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Ett oväntat fel inträffade. Försök igen.'
        )
      } finally {
        if (requestController.current === controller) {
          requestController.current = null
          setLoading(false)
        }
      }
    },
    [city, propertyType, minRooms, minPrice, maxPrice, router]
  )

  useEffect(() => {
    void fetchProperties()

    return () => requestController.current?.abort()

    // Initial hämtning ska använda parametrarna från URL:en vid sidladdning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sortedProperties = useMemo(() => {
    const result = [...properties]

    switch (sort) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price)

      case 'price-desc':
        return result.sort((a, b) => b.price - a.price)

      case 'area-desc':
        return result.sort(
          (a, b) => (b.area ?? 0) - (a.area ?? 0)
        )

      case 'newest':
      default:
        return result.sort((a, b) => {
          const aDate = a.created_at
            ? new Date(a.created_at).getTime()
            : 0

          const bDate = b.created_at
            ? new Date(b.created_at).getTime()
            : 0

          return bDate - aDate
        })
    }
  }, [properties, sort])

  const coordinateCount = properties.filter(
    (property) =>
      property.latitude != null && property.longitude != null
  ).length

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void fetchProperties()
  }

  function resetFilters() {
    setCity('')
    setPropertyType('')
    setMinRooms('')
    setMinPrice('')
    setMaxPrice('')

    void fetchProperties({
      city: '',
      propertyType: '',
      minRooms: '',
      minPrice: '',
      maxPrice: '',
    })
  }

  function removeFilter(key: FilterKey) {
    const nextFilters: Filters = {
      ...currentFilters,
      [key]: '',
    }

    setCity(nextFilters.city)
    setPropertyType(nextFilters.propertyType)
    setMinRooms(nextFilters.minRooms)
    setMinPrice(nextFilters.minPrice)
    setMaxPrice(nextFilters.maxPrice)

    void fetchProperties(nextFilters)
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-white selection:bg-blue-500/30">
      <Header />

      <main id="main-content" className="mx-auto max-w-[1700px]">
        <section
          aria-labelledby="page-title"
          className="relative overflow-hidden border-b border-white/[0.06] px-4 py-8 sm:px-6 sm:py-10 lg:py-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.13),transparent_48%)]"
          />

          <div className="relative mx-auto max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
              FyndBo · Bostäder
            </p>

            <h1
              id="page-title"
              className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.7rem]"
            >
              Hitta ett hem att trivas i.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Sök bland bostäder, jämför priser och utforska lägen på
              kartan. Använd filtren för att hitta det som passar dig.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-7 rounded-2xl border border-white/[0.09] bg-slate-900/75 p-2 shadow-2xl shadow-black/20 sm:p-2.5"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">
                    Sök efter stad, område eller adress
                  </span>

                  <Icon
                    name="search"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="search"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Stad, område eller adress…"
                    autoComplete="off"
                    className="h-12 w-full rounded-xl border border-transparent bg-white/[0.035] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 hover:bg-white/[0.055] focus:border-blue-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters((visible) => !visible)}
                    aria-expanded={showFilters}
                    aria-controls="property-filters"
                    className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition sm:flex-none ${
                      showFilters || hasFilters
                        ? 'border-blue-400/30 bg-blue-500/10 text-blue-200'
                        : 'border-white/[0.09] bg-white/[0.035] text-slate-300 hover:bg-white/[0.07]'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`}
                  >
                    <Icon name="filter" className="h-4 w-4" />
                    Filter

                    {activeFilterCount > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-400 px-1 text-[10px] font-bold text-slate-950">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70 sm:flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    <Icon name="search" className="h-4 w-4" />
                    {loading ? 'Söker…' : 'Sök bostäder'}
                  </button>
                </div>
              </div>

              {showFilters && (
                <div
                  id="property-filters"
                  className="mt-3 border-t border-white/[0.07] px-1 pb-1 pt-4 sm:px-2"
                >
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="block min-w-0">
                      <span className="mb-1.5 block text-xs font-medium text-slate-400">
                        Bostadstyp
                      </span>

                      <select
                        value={propertyType}
                        onChange={(event) =>
                          setPropertyType(event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 text-sm text-slate-200 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                      >
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block min-w-0">
                      <span className="mb-1.5 block text-xs font-medium text-slate-400">
                        Antal rum
                      </span>

                      <select
                        value={minRooms}
                        onChange={(event) =>
                          setMinRooms(event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 text-sm text-slate-200 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                      >
                        {ROOM_OPTIONS.map((room) => (
                          <option key={room.value} value={room.value}>
                            {room.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block min-w-0">
                      <span className="mb-1.5 block text-xs font-medium text-slate-400">
                        Lägsta pris (kr)
                      </span>

                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="any"
                        value={minPrice}
                        onChange={(event) => setMinPrice(event.target.value)}
                        placeholder="Ingen lägsta gräns"
                        className="h-11 w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </label>

                    <label className="block min-w-0">
                      <span className="mb-1.5 block text-xs font-medium text-slate-400">
                        Högsta pris (kr)
                      </span>

                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="any"
                        value={maxPrice}
                        onChange={(event) => setMaxPrice(event.target.value)}
                        placeholder="Ingen högsta gräns"
                        className="h-11 w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={resetFilters}
                      disabled={!hasFilters}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      <Icon name="reset" className="h-4 w-4" />
                      Rensa alla filter
                    </button>

                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-xs font-bold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      Visa resultat
                    </button>
                  </div>
                </div>
              )}
            </form>

            {hasFilters && (
              <div
                className="mt-3 flex flex-wrap items-center gap-2"
                aria-label="Aktiva filter"
              >
                <span className="mr-1 text-xs text-slate-500">
                  Aktiva filter:
                </span>

                {city.trim() && (
                  <FilterChip
                    label={city.trim()}
                    onRemove={() => removeFilter('city')}
                  />
                )}

                {propertyType && (
                  <FilterChip
                    label={propertyTypeLabel(propertyType)}
                    onRemove={() => removeFilter('propertyType')}
                  />
                )}

                {minRooms && (
                  <FilterChip
                    label={`Minst ${minRooms} rum`}
                    onRemove={() => removeFilter('minRooms')}
                  />
                )}

                {minPrice && (
                  <FilterChip
                    label={`Från ${formatNumber(Number(minPrice))} kr`}
                    onRemove={() => removeFilter('minPrice')}
                  />
                )}

                {maxPrice && (
                  <FilterChip
                    label={`Upp till ${formatNumber(Number(maxPrice))} kr`}
                    onRemove={() => removeFilter('maxPrice')}
                  />
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-8 px-2 text-xs text-slate-500 underline decoration-slate-700 underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Rensa allt
                </button>
              </div>
            )}
          </div>
        </section>

        <section
          aria-label="Sökresultat"
          className="px-3 pb-8 pt-4 sm:px-6 sm:pt-5"
        >
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div aria-live="polite" aria-atomic="true">
              <p className="text-sm font-semibold text-white">
                {loading
                  ? 'Söker efter bostäder…'
                  : `${properties.length} ${
                      properties.length === 1
                        ? 'bostad hittad'
                        : 'bostäder hittade'
                    }`}
              </p>

              {!loading && properties.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {coordinateCount} av {properties.length} visas på kartan
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex min-h-10 flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-slate-950/70 px-3 sm:flex-none">
                <span className="whitespace-nowrap text-xs text-slate-500">
                  Sortera
                </span>

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  aria-label="Sortera bostäder"
                  className="min-w-0 flex-1 bg-transparent py-2 text-xs font-medium text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:w-[145px]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-950"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setShowMap((visible) => !visible)}
                aria-pressed={showMap}
                className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition sm:flex-none ${
                  showMap
                    ? 'border-blue-400/25 bg-blue-500/10 text-blue-200'
                    : 'border-white/[0.08] bg-white/[0.035] text-slate-300 hover:bg-white/[0.07]'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`}
              >
                <Icon
                  name={showMap ? 'list' : 'map'}
                  className="h-4 w-4"
                />

                {showMap ? 'Dölj karta' : 'Visa karta'}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 flex flex-col gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3 text-sm text-red-200">
                <Icon
                  name="warning"
                  className="mt-0.5 h-5 w-5 shrink-0"
                />
                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={() => void fetchProperties()}
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-red-300/20 px-4 text-xs font-semibold text-red-100 transition hover:bg-red-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                Försök igen
              </button>
            </div>
          )}

          <div
            className={`grid items-start gap-4 lg:gap-5 ${
              showMap
                ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.9fr)]'
                : 'grid-cols-1'
            }`}
          >
            <div className="min-w-0" aria-busy={loading}>
              {loading ? (
                <LoadingList />
              ) : sortedProperties.length === 0 ? (
                <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] px-6 py-12 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035] text-slate-500">
                      <Icon name="home" className="h-7 w-7" />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-white">
                      Inga bostäder hittades
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Testa en annan stad eller ändra dina filter. Du kan
                      också rensa alla filter och börja om.
                    </p>

                    {hasFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      >
                        <Icon name="reset" className="h-4 w-4" />
                        Rensa filter
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`grid gap-3 ${
                    showMap ? 'grid-cols-1' : 'xl:grid-cols-2'
                  }`}
                >
                  {sortedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      highlighted={
                        hoveredId === property.id ||
                        activePopupId === property.id
                      }
                      onMouseEnter={() => setHoveredId(property.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />
                  ))}
                </div>
              )}
            </div>

            {showMap && (
              <aside
                aria-label="Bostäder på karta"
                className="order-first h-[340px] overflow-hidden rounded-2xl border border-white/[0.09] bg-slate-900 shadow-xl shadow-black/20 sm:h-[420px] lg:sticky lg:top-[150px] lg:order-none lg:h-[calc(100vh-175px)] lg:min-h-[480px]"
              >
                <MapComponent
                  properties={sortedProperties}
                  hoveredId={hoveredId}
                  activePopupId={activePopupId}
                  onPopupChange={setActivePopupId}
                />
              </aside>
            )}
          </div>

          <footer className="mt-8 border-t border-white/[0.06] py-5 text-center text-xs text-slate-600">
            Bostäder visas utifrån tillgänglig information. Kontrollera
            alltid uppgifterna med säljaren eller ansvarig mäklare.
          </footer>
        </section>
      </main>
    </div>
  )
}

export default function BostaderPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-[#080d18] text-white"
          role="status"
        >
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-blue-400/20 border-t-blue-400" />

            <p className="mt-4 text-sm text-slate-400">
              Förbereder bostäder…
            </p>
          </div>
        </div>
      }
    >
      <BostaderContent />
    </Suspense>
  )
}