'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  NEWSLETTER_TEMPLATES,
  buildNewsletterHtml,
} from '../../lib/emailTemplates'

// ============================================================
// TYPER
// ============================================================

interface EmailEntry {
  id: number
  email: string
  created_at: string
}

interface AdminUser {
  id: number
  email: string
  created_at: string
  added_by: string | null
  has_password: boolean
  role?: string
}

interface Property {
  id: number
  title: string
  description: string | null
  price: number

  area: number | null
  rooms: number | null

  city: string | null
  address: string | null
  postal_code?: string | null

  image_url: string | null
  listing_url: string | null

  latitude: number | null
  longitude: number | null

  created_by?: string | null
  created_at?: string
  updated_at?: string

  monthly_fee?: number | null
  operating_cost?: number | null

  floor?: string | null

  elevator?: boolean
  balcony?: boolean

  images?: string[]

  property_type?: string | null
  construction_year?: number | null
  plot_area?: number | null
  energy_class?: string | null
  association?: string | null

  is_active?: boolean
}

interface PropertyForm {
  title: string
  description: string
  price: string

  area: string
  rooms: string

  address: string
  city: string
  postal_code: string

  image_url: string
  listing_url: string

  latitude: string
  longitude: string

  monthly_fee: string
  operating_cost: string

  floor: string

  elevator: boolean
  balcony: boolean

  images: string[]

  property_type: string
  construction_year: string
  plot_area: string
  energy_class: string
  association: string
}

interface BrevoList {
  id: number
  name: string
  totalSubscribers?: number
}

interface SelectOption {
  value: string
  label: string
  description?: string
}


type Section =
  | 'dashboard'
  | 'properties'
  | 'subscribers'
  | 'admins'
  | 'newsletter'
  | 'analytics'

type PropertyStatus =
  | 'all'
  | 'active'
  | 'inactive'

// ============================================================
// STANDARDVÄRDEN
// ============================================================

const EMPTY_PROPERTY_FORM: PropertyForm = {
  title: '',
  description: '',
  price: '',

  area: '',
  rooms: '',

  address: '',
  city: '',
  postal_code: '',

  image_url: '',
  listing_url: '',

  latitude: '',
  longitude: '',

  monthly_fee: '',
  operating_cost: '',

  floor: '',

  elevator: false,
  balcony: false,

  images: [],

  property_type: '',
  construction_year: '',
  plot_area: '',
  energy_class: '',
  association: '',
}


// ============================================================
// SELECT OPTIONS
// ============================================================

const PROPERTY_TYPE_OPTIONS: SelectOption[] = [
  {
    value: '',
    label: 'Ingen vald',
  },
  {
    value: 'villa',
    label: 'Villa',
  },
  {
    value: 'lägenhet',
    label: 'Lägenhet',
  },
  {
    value: 'radhus',
    label: 'Radhus',
  },
  {
    value: 'fritidshus',
    label: 'Fritidshus',
  },
  {
    value: 'tomt',
    label: 'Tomt',
  },
  {
    value: 'gård',
    label: 'Gård / Skog',
  },
]

const ENERGY_OPTIONS: SelectOption[] = [
  {
    value: '',
    label: 'Ingen vald',
  },
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(
    (energyClass) => ({
      value: energyClass,
      label: `Energiklass ${energyClass}`,
    })
  ),
]

const STATUS_OPTIONS: SelectOption[] = [
  {
    value: 'all',
    label: 'Alla bostäder',
    description: 'Aktiva och inaktiva',
  },
  {
    value: 'active',
    label: 'Aktiva bostäder',
    description: 'Visas publikt på FyndBo',
  },
  {
    value: 'inactive',
    label: 'Inaktiva bostäder',
    description: 'Dolda från besökare',
  },
]

const ROLE_OPTIONS: SelectOption[] = [
  {
    value: 'admin',
    label: 'Administratör',
    description: 'Full åtkomst till adminpanelen',
  },
  {
    value: 'maklare',
    label: 'Mäklare',
    description: 'Hanterar sina egna bostäder',
  },
]

// ============================================================
// CSS
// ============================================================

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.055] focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50'

const labelClass =
  'mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600'

const cardClass =
  'rounded-2xl border border-white/[0.07] bg-white/[0.025]'

// ============================================================
// IKONER
// ============================================================

type IconName =
  | 'dashboard'
  | 'home'
  | 'users'
  | 'email'
  | 'send'
  | 'analytics'
  | 'logout'
  | 'external'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'archive'
  | 'restore'
  | 'download'
  | 'upload'
  | 'search'
  | 'check'
  | 'refresh'
  | 'close'
  | 'map'
  | 'image'
  | 'warning'
  | 'chevron'
  | 'inbox'
  | 'eye'
  | 'calendar'
  | 'link'
  | 'mail'

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
    strokeLinecap:
      'round' as const,
    strokeLinejoin:
      'round' as const,
  }

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
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

    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21a7 7 0 0 1 14 0" />
          <path d="M16 4.5a4 4 0 0 1 0 7" />
          <path d="M18 14a6 6 0 0 1 4 5.7" />
        </svg>
      )

    case 'email':
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      )

    case 'send':
      return (
        <svg {...common}>
          <path d="m22 2-7 20-4-9-9-4 20-7Z" />
          <path d="M22 2 11 13" />
        </svg>
      )

    case 'analytics':
      return (
        <svg {...common}>
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </svg>
      )

    case 'logout':
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
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

    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )

    case 'edit':
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      )

    case 'trash':
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M9 7V4h6v3" />
          <path d="m6 7 1 14h10l1-14" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      )

    case 'archive':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="5" rx="1" />
          <path d="M5 9v11h14V9" />
          <path d="M9 13h6" />
        </svg>
      )

    case 'restore':
      return (
        <svg {...common}>
          <path d="M4 4v6h6" />
          <path d="M5 15a8 8 0 1 0 1-8l-2 3" />
        </svg>
      )

    case 'download':
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      )

    case 'upload':
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
        </svg>
      )

    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      )

    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )

    case 'refresh':
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 1 0 1 4" />
          <path d="M20 4v7h-7" />
        </svg>
      )

    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      )

    case 'map':
      return (
        <svg {...common}>
          <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
          <path d="M9 3v15M15 6v15" />
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

    case 'warning':
      return (
        <svg {...common}>
          <path d="M12 3 2 21h20Z" />
          <path d="M12 9v5M12 18h.01" />
        </svg>
      )

    case 'chevron':
      return (
        <svg {...common}>
          <path d="m7 9 5 5 5-5" />
        </svg>
      )

    case 'inbox':
      return (
        <svg {...common}>
          <path d="M4 4h16l2 10v6H2v-6Z" />
          <path d="M2 14h6l2 3h4l2-3h6" />
        </svg>
      )

    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )

    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      )

    case 'link':
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" />
          <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
        </svg>
      )

    default:
      return null
  }
}

// ============================================================
// EGEN DROPDOWN
// ============================================================

function CustomSelect({
  value,
  options,
  onChange,
  placeholder = 'Välj...',
  disabled = false,
}: {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] =
    useState(false)

  const wrapperRef =
    useRef<HTMLDivElement>(null)

  const selected =
    options.find(
      (option) =>
        option.value === value
    )

  useEffect(() => {
    function handleOutside(
      event: MouseEvent
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutside
      )
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen(
            (current) => !current
          )
        }
        className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${
          open
            ? 'border-blue-500/40 bg-blue-500/[0.06] ring-2 ring-blue-500/10'
            : 'border-white/[0.08] bg-white/[0.035] hover:border-white/[0.14] hover:bg-white/[0.05]'
        } ${
          disabled
            ? 'cursor-not-allowed opacity-50'
            : ''
        }`}
      >
        <div className="min-w-0 flex-1">

          <p
            className={`truncate text-sm ${
              selected
                ? 'text-slate-200'
                : 'text-slate-600'
            }`}
          >
            {selected?.label ||
              placeholder}
          </p>

          {selected?.description && (
            <p className="mt-0.5 truncate text-[10px] text-slate-600">
              {selected.description}
            </p>
          )}

        </div>

        <Icon
          name="chevron"
          className={`h-4 w-4 shrink-0 text-slate-600 transition-transform ${
            open
              ? 'rotate-180'
              : ''
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[120] max-h-72 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#111827] p-1.5 shadow-2xl shadow-black/50">

          {options.map(
            (option) => {
              const active =
                option.value ===
                value

              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  onClick={() => {
                    onChange(
                      option.value
                    )

                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    active
                      ? 'bg-blue-500/[0.1]'
                      : 'hover:bg-white/[0.045]'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      active
                        ? 'border-blue-500 bg-blue-600'
                        : 'border-white/[0.1]'
                    }`}
                  >
                    {active && (
                      <Icon
                        name="check"
                        className="h-3 w-3 text-white"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p
                      className={`text-sm ${
                        active
                          ? 'font-medium text-blue-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {option.label}
                    </p>

                    {option.description && (
                      <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">
                        {option.description}
                      </p>
                    )}

                  </div>

                </button>
              )
            }
          )}

        </div>
      )}
    </div>
  )
}

// ============================================================
// ADMIN
// ============================================================

export default function AdminPage() {
  const {
    data: session,
    status,
  } = useSession()

  const router =
    useRouter()

  const role =
    (session?.user as any)?.role

  const isAdmin =
    role === 'admin'

  const isMaklare =
    role === 'maklare'

  const userEmail =
    session?.user?.email || ''

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<Section>(
      'dashboard'
    )

  // ==========================================================
  // DATA
  // ==========================================================

  const [
    properties,
    setProperties,
  ] =
    useState<Property[]>([])

  const [
    emails,
    setEmails,
  ] =
    useState<EmailEntry[]>([])

  const [
    admins,
    setAdmins,
  ] =
    useState<AdminUser[]>([])

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  // ==========================================================
  // MEDDELANDEN
  // ==========================================================

  const [
    successMsg,
    setSuccessMsg,
  ] =
    useState('')

  const [
    errorMsg,
    setErrorMsg,
  ] =
    useState('')

  // ==========================================================
  // PROPERTY
  // ==========================================================

  const [
    propertySearch,
    setPropertySearch,
  ] =
    useState('')

  const [
    propertyStatus,
    setPropertyStatus,
  ] =
    useState<PropertyStatus>(
      'all'
    )

  const [
    showPropertyEditor,
    setShowPropertyEditor,
  ] =
    useState(false)

  const [
    editingProperty,
    setEditingProperty,
  ] =
    useState<Property | null>(
      null
    )

  const [
    propertyForm,
    setPropertyForm,
  ] =
    useState<PropertyForm>({
      ...EMPTY_PROPERTY_FORM,
      images: [],
    })

  const [
    uploading,
    setUploading,
  ] =
    useState(false)

  const [
    geocoding,
    setGeocoding,
  ] =
    useState(false)

  const [
    savingProperty,
    setSavingProperty,
  ] =
    useState(false)

  const [
    changingStatusId,
    setChangingStatusId,
  ] =
    useState<number | null>(
      null
    )

  const [
    deletingPropertyId,
    setDeletingPropertyId,
  ] =
    useState<number | null>(
      null
    )

  // ==========================================================
  // USERS
  // ==========================================================

  const [
    newAdminEmail,
    setNewAdminEmail,
  ] =
    useState('')

  const [
    newAdminPassword,
    setNewAdminPassword,
  ] =
    useState('')

  const [
    newAdminRole,
    setNewAdminRole,
  ] =
    useState<
      'admin' | 'maklare'
    >('admin')

  const [
    addingAdmin,
    setAddingAdmin,
  ] =
    useState(false)

  const [
    deletingAdminId,
    setDeletingAdminId,
  ] =
    useState<number | null>(
      null
    )

  // ==========================================================
  // BREVO
  // ==========================================================

  const [
    brevoLists,
    setBrevoLists,
  ] =
    useState<BrevoList[]>([])

  const [
    selectedBrevoList,
    setSelectedBrevoList,
  ] =
    useState('')

  const [
    loadingBrevo,
    setLoadingBrevo,
  ] =
    useState(false)

  // ==========================================================
  // NEWSLETTER
  // ==========================================================

  const [
    selectedTemplate,
    setSelectedTemplate,
  ] =
    useState('welcome')

  const defaultTemplate =
    NEWSLETTER_TEMPLATES.welcome

  const [
    newsletterSubject,
    setNewsletterSubject,
  ] =
    useState(
      defaultTemplate.subject
    )

  const [
    newsletterPreheader,
    setNewsletterPreheader,
  ] =
    useState(
      defaultTemplate.preheader
    )

  const [
    newsletterHeading,
    setNewsletterHeading,
  ] =
    useState(
      defaultTemplate.heading
    )

  const [
    newsletterMessage,
    setNewsletterMessage,
  ] =
    useState(
      defaultTemplate.message
    )

  const [
    newsletterCtaLabel,
    setNewsletterCtaLabel,
  ] =
    useState(
      defaultTemplate.ctaLabel
    )

  const [
    newsletterCtaUrl,
    setNewsletterCtaUrl,
  ] =
    useState(
      defaultTemplate.ctaUrl
    )

  const [
    newsletterHeroUrl,
    setNewsletterHeroUrl,
  ] =
    useState(
      defaultTemplate.heroUrl
    )

  const [
    newsletterTestEmail,
    setNewsletterTestEmail,
  ] =
    useState('')

  const [
    sendingNewsletter,
    setSendingNewsletter,
  ] =
    useState(false)

  // ==========================================================
  // TOAST
  // ==========================================================

  function showSuccess(
    message: string
  ) {
    setErrorMsg('')
    setSuccessMsg(message)

    window.setTimeout(
      () => {
        setSuccessMsg('')
      },
      4000
    )
  }

  function showError(
    message: string
  ) {
    setSuccessMsg('')
    setErrorMsg(message)

    window.setTimeout(
      () => {
        setErrorMsg('')
      },
      5000
    )
  }

  // ==========================================================
  // FETCH PROPERTIES
  // ==========================================================

  async function fetchProperties() {
    try {
      const response =
        await fetch(
          '/api/properties?includeInactive=true',
          {
            cache:
              'no-store',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Kunde inte hämta bostäder.'
        )
      }

      setProperties(
        data.properties || []
      )
    } catch (error: any) {
      console.error(error)

      showError(
        error?.message ||
          'Kunde inte hämta bostäder.'
      )
    }
  }

  // ==========================================================
  // FETCH EMAILS
  // ==========================================================

  async function fetchEmails() {
    if (!isAdmin) {
      return
    }

    try {
      const response =
        await fetch(
          '/api/admin/emails',
          {
            cache:
              'no-store',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Kunde inte hämta prenumeranter.'
        )
      }

      setEmails(
        data.emails || []
      )
    } catch (error) {
      console.error(error)
    }
  }

  // ==========================================================
  // FETCH USERS
  // ==========================================================

  async function fetchAdmins() {
    if (!isAdmin) {
      return
    }

    try {
      const response =
        await fetch(
          '/api/admin/users',
          {
            cache:
              'no-store',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Kunde inte hämta användare.'
        )
      }

      setAdmins(
        data.admins || []
      )
    } catch (error) {
      console.error(error)
    }
  }

  // ==========================================================
  // FETCH BREVO
  // ==========================================================

  async function fetchBrevoLists() {
    if (!isAdmin) {
      return
    }

    setLoadingBrevo(true)

    try {
      const response =
        await fetch(
          '/api/brevo/lists',
          {
            cache:
              'no-store',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Kunde inte hämta Brevo-listor.'
        )
      }

      const lists: BrevoList[] =
        data.lists || []

      setBrevoLists(
        lists
      )

      setSelectedBrevoList(
        (current) => {
          if (
            current &&
            lists.some(
              (list) =>
                String(
                  list.id
                ) === current
            )
          ) {
            return current
          }

          return lists[0]
            ? String(
                lists[0].id
              )
            : ''
        }
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingBrevo(false)
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    if (
      status ===
      'unauthenticated'
    ) {
      router.replace(
        '/admin/login'
      )

      return
    }

    if (
      status !==
      'authenticated'
    ) {
      return
    }

    async function load() {
      setLoading(true)

      const tasks: Promise<any>[] =
        [
          fetchProperties(),
        ]

      if (isAdmin) {
        tasks.push(
          fetchEmails(),
          fetchAdmins(),
          fetchBrevoLists()
        )
      }

      await Promise.all(
        tasks
      )

      setLoading(false)
    }

    load()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    status,
    isAdmin,
  ])

  // ==========================================================
  // MÄKLARE FÅR INTE ADMIN-SEKTIONER
  // ==========================================================

  useEffect(() => {
    if (
      isMaklare &&
      ![
        'dashboard',
        'properties',
      ].includes(
        activeSection
      )
    ) {
      setActiveSection(
        'dashboard'
      )
    }
  }, [
    isMaklare,
    activeSection,
  ])

  // ==========================================================
  // STATS
  // ==========================================================

  const activeProperties =
    properties.filter(
      (property) =>
        property.is_active !==
        false
    )

  const inactiveProperties =
    properties.filter(
      (property) =>
        property.is_active ===
        false
    )

  const withCoordinates =
    properties.filter(
      (property) =>
        property.latitude !=
          null &&
        property.longitude !=
          null
    ).length

  const withImages =
    properties.filter(
      (property) =>
        Boolean(
          property.images
            ?.length ||
            property.image_url
        )
    ).length

  const withListingUrl =
    properties.filter(
      (property) =>
        Boolean(
          property.listing_url
        )
    ).length

  const emailsToday =
    emails.filter(
      (entry) =>
        new Date(
          entry.created_at
        ).toDateString() ===
        new Date().toDateString()
    ).length

  const emailsThisWeek =
    emails.filter(
      (entry) => {
        const sevenDaysAgo =
          new Date(
            Date.now() -
              7 *
                24 *
                60 *
                60 *
                1000
          )

        return (
          new Date(
            entry.created_at
          ) >= sevenDaysAgo
        )
      }
    ).length

  // ==========================================================
  // PROPERTY FILTER
  // ==========================================================

  const filteredProperties =
    useMemo(() => {
      const search =
        propertySearch
          .trim()
          .toLowerCase()

      return properties.filter(
        (property) => {
          if (
            propertyStatus ===
              'active' &&
            property.is_active ===
              false
          ) {
            return false
          }

          if (
            propertyStatus ===
              'inactive' &&
            property.is_active !==
              false
          ) {
            return false
          }

          if (!search) {
            return true
          }

          const haystack = [
            property.title,
            property.address,
            property.city,
            property.postal_code,
            property.property_type,
            property.created_by,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return haystack.includes(
            search
          )
        }
      )
    }, [
      properties,
      propertySearch,
      propertyStatus,
    ])

  // ==========================================================
  // PROPERTY EDITOR
  // ==========================================================

  function closePropertyEditor() {
    setShowPropertyEditor(
      false
    )

    setEditingProperty(
      null
    )

    setPropertyForm({
      ...EMPTY_PROPERTY_FORM,
      images: [],
    })
  }

  function openNewProperty() {
    setEditingProperty(
      null
    )

    setPropertyForm({
      ...EMPTY_PROPERTY_FORM,
      images: [],
    })

    setShowPropertyEditor(
      true
    )
  }

  function openEditProperty(
    property: Property
  ) {
    setEditingProperty(
      property
    )

    setPropertyForm({
      title:
        property.title || '',

      description:
        property.description ||
        '',

      price:
        String(
          property.price || ''
        ),

      area:
        property.area != null
          ? String(
              property.area
            )
          : '',

      rooms:
        property.rooms != null
          ? String(
              property.rooms
            )
          : '',

      address:
        property.address || '',

      city:
        property.city || '',

      postal_code:
        property.postal_code ||
        '',

      image_url:
        property.image_url || '',

      listing_url:
        property.listing_url ||
        '',

      latitude:
        property.latitude != null
          ? String(
              property.latitude
            )
          : '',

      longitude:
        property.longitude !=
        null
          ? String(
              property.longitude
            )
          : '',

      monthly_fee:
        property.monthly_fee !=
        null
          ? String(
              property.monthly_fee
            )
          : '',

      operating_cost:
        property.operating_cost !=
        null
          ? String(
              property.operating_cost
            )
          : '',

      floor:
        property.floor || '',

      elevator:
        Boolean(
          property.elevator
        ),

      balcony:
        Boolean(
          property.balcony
        ),

      images:
        property.images || [],

      property_type:
        property.property_type ||
        '',

      construction_year:
        property.construction_year !=
        null
          ? String(
              property.construction_year
            )
          : '',

      plot_area:
        property.plot_area !=
        null
          ? String(
              property.plot_area
            )
          : '',

      energy_class:
        property.energy_class ||
        '',

      association:
        property.association ||
        '',
    })

    setShowPropertyEditor(
      true
    )
  }

  // ==========================================================
  // UPLOAD
  // ==========================================================

  async function uploadFiles(
    files: File[]
  ) {
    const imageFiles =
      files.filter(
        (file) =>
          file.type.startsWith(
            'image/'
          )
      )

    if (
      imageFiles.length ===
      0
    ) {
      showError(
        'Välj minst en giltig bild.'
      )

      return
    }

    setUploading(true)

    try {
      const urls: string[] =
        []

      for (
        const file of imageFiles
      ) {
        const formData =
          new FormData()

        formData.append(
          'file',
          file
        )

        const response =
          await fetch(
            '/api/upload',
            {
              method:
                'POST',

              body:
                formData,
            }
          )

        const data =
          await response.json()

        if (!response.ok) {
          throw new Error(
            data.error ||
              `Kunde inte ladda upp ${file.name}.`
          )
        }

        if (data.url) {
          urls.push(
            data.url
          )
        }
      }

      setPropertyForm(
        (previous) => ({
          ...previous,

          images: [
            ...previous.images,
            ...urls,
          ],

          image_url:
            previous.image_url ||
            urls[0] ||
            '',
        })
      )

      showSuccess(
        urls.length === 1
          ? 'Bilden har laddats upp.'
          : `${urls.length} bilder har laddats upp.`
      )
    } catch (error: any) {
      showError(
        error?.message ||
          'Bildöverföringen misslyckades.'
      )
    } finally {
      setUploading(false)
    }
  }

  function removePropertyImage(
    index: number
  ) {
    setPropertyForm(
      (previous) => {
        const removedUrl =
          previous.images[index]

        const images =
          previous.images.filter(
            (_, imageIndex) =>
              imageIndex !==
              index
          )

        return {
          ...previous,

          images,

          image_url:
            previous.image_url ===
            removedUrl
              ? images[0] ||
                ''
              : previous.image_url,
        }
      }
    )
  }

  // ==========================================================
  // GEOCODE
  // ==========================================================

  async function handleGeocode() {
    if (
      !propertyForm.address.trim() ||
      !propertyForm.city.trim()
    ) {
      showError(
        'Fyll i adress och ort först.'
      )

      return
    }

    setGeocoding(true)

    try {
      const params =
        new URLSearchParams({
          address:
            propertyForm.address.trim(),

          city:
            propertyForm.city.trim(),
        })

      if (
        propertyForm.postal_code.trim()
      ) {
        params.set(
          'postal_code',
          propertyForm.postal_code.trim()
        )
      }

      const response =
        await fetch(
          `/api/geocode?${params.toString()}`
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        data.lat == null ||
        data.lon == null
      ) {
        throw new Error(
          data.error ||
            'Adressen kunde inte hittas.'
        )
      }

      setPropertyForm(
        (previous) => ({
          ...previous,

          latitude:
            String(
              data.lat
            ),

          longitude:
            String(
              data.lon
            ),
        })
      )

      showSuccess(
        'Kartpositionen har hittats.'
      )
    } catch (error: any) {
      showError(
        error?.message ||
          'Kunde inte hämta koordinater.'
      )
    } finally {
      setGeocoding(false)
    }
  }

  // ==========================================================
  // SAVE PROPERTY
  // ==========================================================

  async function handleSaveProperty() {
    if (
      !propertyForm.title.trim()
    ) {
      showError(
        'Titel krävs.'
      )

      return
    }

    if (
      !propertyForm.price ||
      Number(
        propertyForm.price
      ) <= 0
    ) {
      showError(
        'Ange ett giltigt pris.'
      )

      return
    }

    setSavingProperty(true)

    try {
      const body = {
        ...propertyForm,

        title:
          propertyForm.title.trim(),

        description:
          propertyForm.description.trim() ||
          null,

        price:
          Number(
            propertyForm.price
          ),

        area:
          propertyForm.area
            ? Number(
                propertyForm.area
              )
            : null,

        rooms:
          propertyForm.rooms
            ? Number(
                propertyForm.rooms
              )
            : null,

        monthly_fee:
          propertyForm.monthly_fee
            ? Number(
                propertyForm.monthly_fee
              )
            : null,

        operating_cost:
          propertyForm.operating_cost
            ? Number(
                propertyForm.operating_cost
              )
            : null,

        construction_year:
          propertyForm.construction_year
            ? Number(
                propertyForm.construction_year
              )
            : null,

        plot_area:
          propertyForm.plot_area
            ? Number(
                propertyForm.plot_area
              )
            : null,

        latitude:
          propertyForm.latitude
            ? Number(
                propertyForm.latitude
              )
            : null,

        longitude:
          propertyForm.longitude
            ? Number(
                propertyForm.longitude
              )
            : null,

        image_url:
          propertyForm.image_url ||
          propertyForm.images[0] ||
          null,
      }

      const response =
        await fetch(
          '/api/properties',
          {
            method:
              editingProperty
                ? 'PUT'
                : 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                editingProperty
                  ? {
                      ...body,

                      id:
                        editingProperty.id,
                    }
                  : body
              ),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Bostaden kunde inte sparas.'
        )
      }

      showSuccess(
        editingProperty
          ? 'Bostaden har uppdaterats.'
          : 'Bostaden har publicerats.'
      )

      closePropertyEditor()

      await fetchProperties()
    } catch (error: any) {
      showError(
        error?.message ||
          'Bostaden kunde inte sparas.'
      )
    } finally {
      setSavingProperty(false)
    }
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  async function changePropertyStatus(
    property: Property,
    active: boolean
  ) {
    const action =
      active
        ? 'återaktivera'
        : 'inaktivera'

    if (
      !window.confirm(
        `Vill du ${action} "${property.title}"?`
      )
    ) {
      return
    }

    setChangingStatusId(
      property.id
    )

    try {
      const response =
        await fetch(
          '/api/properties',
          {
            method:
              'PATCH',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                id:
                  property.id,

                is_active:
                  active,
              }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Kunde inte ändra status.'
        )
      }

      showSuccess(
        active
          ? 'Bostaden är aktiv igen.'
          : 'Bostaden har inaktiverats.'
      )

      await fetchProperties()
    } catch (error: any) {
      showError(
        error?.message ||
          'Kunde inte ändra status.'
      )
    } finally {
      setChangingStatusId(
        null
      )
    }
  }

  // ==========================================================
  // PERMANENT DELETE
  // ==========================================================

  async function permanentlyDeleteProperty(
    property: Property
  ) {
    if (!isAdmin) {
      return
    }

    if (
      !window.confirm(
        `"${property.title}" kommer att raderas permanent ur databasen. Detta går inte att ångra.`
      )
    ) {
      return
    }

    if (
      !window.confirm(
        'Bekräfta permanent radering.'
      )
    ) {
      return
    }

    setDeletingPropertyId(
      property.id
    )

    try {
      const response =
        await fetch(
          `/api/properties?id=${property.id}&permanent=true`,
          {
            method:
              'DELETE',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Kunde inte radera bostaden.'
        )
      }

      showSuccess(
        'Bostaden har raderats permanent.'
      )

      await fetchProperties()
    } catch (error: any) {
      showError(
        error?.message ||
          'Kunde inte radera bostaden.'
      )
    } finally {
      setDeletingPropertyId(
        null
      )
    }
  }

  // ==========================================================
  // USERS
  // ==========================================================

  async function handleAddAdmin() {
    const email =
      newAdminEmail
        .trim()
        .toLowerCase()

    if (
      !email ||
      !email.includes('@')
    ) {
      showError(
        'Ange en giltig e-postadress.'
      )

      return
    }

    setAddingAdmin(true)

    try {
      const body: any = {
        email,
        role:
          newAdminRole,
      }

      if (
        newAdminPassword.trim()
      ) {
        body.password =
          newAdminPassword
      }

      const response =
        await fetch(
          '/api/admin/users',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                body
              ),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Kunde inte lägga till användaren.'
        )
      }

      showSuccess(
        'Användaren har lagts till.'
      )

      setNewAdminEmail('')
      setNewAdminPassword('')
      setNewAdminRole(
        'admin'
      )

      await fetchAdmins()
    } catch (error: any) {
      showError(
        error?.message ||
          'Kunde inte lägga till användaren.'
      )
    } finally {
      setAddingAdmin(false)
    }
  }

  async function deleteAdmin(
    admin: AdminUser
  ) {
    if (
      admin.email.toLowerCase() ===
      userEmail.toLowerCase()
    ) {
      showError(
        'Du kan inte ta bort ditt eget konto.'
      )

      return
    }

    if (
      !window.confirm(
        `Ta bort ${admin.email}?`
      )
    ) {
      return
    }

    setDeletingAdminId(
      admin.id
    )

    try {
      const response =
        await fetch(
          '/api/admin/users',
          {
            method:
              'DELETE',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                id:
                  admin.id,
              }),
          }
        )

      const data =
        await response
          .json()
          .catch(
            () => ({})
          )

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Kunde inte ta bort användaren.'
        )
      }

      showSuccess(
        'Användaren har tagits bort.'
      )

      await fetchAdmins()
    } catch (error: any) {
      showError(
        error?.message ||
          'Kunde inte ta bort användaren.'
      )
    } finally {
      setDeletingAdminId(
        null
      )
    }
  }

  // ==========================================================
  // SUBSCRIBERS
  // ==========================================================

  async function deleteSubscriber(
    subscriber: EmailEntry
  ) {
    if (
      !window.confirm(
        `Ta bort ${subscriber.email} från prenumerantlistan?`
      )
    ) {
      return
    }

    try {
      const response =
        await fetch(
          '/api/admin/emails',
          {
            method:
              'DELETE',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                id:
                  subscriber.id,
              }),
          }
        )

      const data =
        await response
          .json()
          .catch(
            () => ({})
          )

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Kunde inte ta bort prenumeranten.'
        )
      }

      setEmails(
        (current) =>
          current.filter(
            (entry) =>
              entry.id !==
              subscriber.id
          )
      )

      showSuccess(
        'Prenumeranten har tagits bort.'
      )
    } catch (error: any) {
      showError(
        error?.message ||
          'Kunde inte ta bort prenumeranten.'
      )
    }
  }

  function exportCSV() {
    const rows = [
      [
        'ID',
        'E-post',
        'Registrerad',
      ],

      ...emails.map(
        (entry) => [
          entry.id,
          entry.email,
          formatDate(
            entry.created_at
          ),
        ]
      ),
    ]

    const csv =
      rows
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(
                  value
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(',')
        )
        .join('\n')

    const blob =
      new Blob(
        [
          '\uFEFF' +
            csv,
        ],
        {
          type:
            'text/csv;charset=utf-8;',
        }
      )

    const url =
      URL.createObjectURL(
        blob
      )

    const link =
      document.createElement(
        'a'
      )

    link.href = url

    link.download =
      `fyndbo-prenumeranter-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`

    document.body.appendChild(
      link
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url
    )
  }

  // ==========================================================
  // NEWSLETTER
  // ==========================================================

  function loadNewsletterTemplate(
    key: string
  ) {
    const template =
      NEWSLETTER_TEMPLATES[
        key
      ]

    if (!template) {
      return
    }

    setSelectedTemplate(
      key
    )

    setNewsletterSubject(
      template.subject
    )

    setNewsletterPreheader(
      template.preheader
    )

    setNewsletterHeading(
      template.heading
    )

    setNewsletterMessage(
      template.message
    )

    setNewsletterCtaLabel(
      template.ctaLabel
    )

    setNewsletterCtaUrl(
      template.ctaUrl
    )

    setNewsletterHeroUrl(
      template.heroUrl
    )
  }

  const newsletterHtml =
    useMemo(
      () =>
        buildNewsletterHtml({
          templateKey:
            selectedTemplate,

          subject:
            newsletterSubject,

          preheader:
            newsletterPreheader,

          heading:
            newsletterHeading,

          message:
            newsletterMessage,

          ctaLabel:
            newsletterCtaLabel,

          ctaUrl:
            newsletterCtaUrl,

          heroUrl:
            newsletterHeroUrl,
        }),
      [
        selectedTemplate,
        newsletterSubject,
        newsletterPreheader,
        newsletterHeading,
        newsletterMessage,
        newsletterCtaLabel,
        newsletterCtaUrl,
        newsletterHeroUrl,
      ]
    )

  async function sendNewsletter() {
    if (
      !selectedBrevoList
    ) {
      showError(
        'Välj en mottagarlista.'
      )

      return
    }

    if (
      !newsletterSubject.trim()
    ) {
      showError(
        'Ämnesrad krävs.'
      )

      return
    }

    if (
      !newsletterHeading.trim() ||
      !newsletterMessage.trim()
    ) {
      showError(
        'Rubrik och meddelande krävs.'
      )

      return
    }

    if (
      newsletterTestEmail &&
      !newsletterTestEmail.includes(
        '@'
      )
    ) {
      showError(
        'Testadressen är inte giltig.'
      )

      return
    }

    if (
      !newsletterTestEmail &&
      !window.confirm(
        'Vill du skicka nyhetsbrevet till hela den valda mottagarlistan?'
      )
    ) {
      return
    }

    setSendingNewsletter(
      true
    )

    try {
      const response =
        await fetch(
          '/api/brevo/send',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                listId:
                  Number(
                    selectedBrevoList
                  ),

                subject:
                  newsletterSubject.trim(),

                preheader:
                  newsletterPreheader.trim(),

                content:
                  newsletterHtml,

                testEmail:
                  newsletterTestEmail.trim() ||
                  undefined,
              }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Nyhetsbrevet kunde inte skickas.'
        )
      }

      showSuccess(
        data.message ||
          (newsletterTestEmail
            ? 'Testutskicket har skickats.'
            : 'Nyhetsbrevet har skickats till Brevo för utskick.')
      )
    } catch (error: any) {
      showError(
        error?.message ||
          'Nyhetsbrevet kunde inte skickas.'
      )
    } finally {
      setSendingNewsletter(
        false
      )
    }
  }

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigation = [
    {
      title:
        'Översikt',

      items: [
        {
          id:
            'dashboard' as Section,

          label:
            'Dashboard',

          icon:
            'dashboard' as IconName,
        },
      ],
    },

    {
      title:
        'Innehåll',

      items: [
        {
          id:
            'properties' as Section,

          label:
            'Bostäder',

          icon:
            'home' as IconName,

          count:
            properties.length,
        },
      ],
    },

    ...(isAdmin
      ? [
          {
            title:
              'Kontakter',

            items: [
              {
                id:
                  'subscribers' as Section,

                label:
                  'Prenumeranter',

                icon:
                  'inbox' as IconName,

                count:
                  emails.length,
              },

              {
                id:
                  'admins' as Section,

                label:
                  'Användare',

                icon:
                  'users' as IconName,

                count:
                  admins.length,
              },
            ],
          },

          {
            title:
              'Kommunikation',

            items: [
              {
                id:
                  'newsletter' as Section,

                label:
                  'Nyhetsbrev',

                icon:
                  'send' as IconName,
              },
            ],
          },

          {
            title:
              'System',

            items: [
              {
                id:
                  'analytics' as Section,

                label:
                  'Datakvalitet',

                icon:
                  'analytics' as IconName,
              },
            ],
          },
        ]
      : []),
  ]

  const allNavigationItems =
    navigation.flatMap(
      (group) =>
        group.items
    )

  const currentPage =
    allNavigationItems.find(
      (item) =>
        item.id ===
        activeSection
    )

  const pageDescriptions: Record<
    Section,
    string
  > = {
    dashboard:
      'En snabb överblick över FyndBo.',

    properties:
      'Hantera publicerade och inaktiva bostäder.',

    subscribers:
      'Hantera personer som anmält sitt intresse.',

    admins:
      'Hantera administratörer och mäklarkonton.',

    newsletter:
      'Skapa och skicka professionella FyndBo-utskick.',

    analytics:
      'Kontrollera kvaliteten på bostadsinformationen.',
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    status === 'loading' ||
    loading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">

        <div className="text-center">

          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-white/[0.08] border-t-blue-500" />

          <p className="mt-4 text-xs text-slate-600">
            Laddar FyndBo Admin
          </p>

        </div>

      </div>
    )
  }

  if (!session) {
    return null
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {successMsg && (
        <Toast
          type="success"
          text={successMsg}
        />
      )}

      {errorMsg && (
        <Toast
          type="error"
          text={errorMsg}
        />
      )}

      {showPropertyEditor && (
        <PropertyEditor
          form={
            propertyForm
          }
          setForm={
            setPropertyForm
          }
          editing={
            editingProperty
          }
          uploading={
            uploading
          }
          geocoding={
            geocoding
          }
          saving={
            savingProperty
          }
          onClose={
            closePropertyEditor
          }
          onUpload={
            uploadFiles
          }
          onRemoveImage={
            removePropertyImage
          }
          onGeocode={
            handleGeocode
          }
          onSave={
            handleSaveProperty
          }
        />
      )}

      <div className="flex min-h-screen">

        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col border-r border-white/[0.055] bg-[#080d18] lg:flex">

          <div className="px-5 pb-6 pt-6">

            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <Image
                src="/Fyndbo-blue-bkg.png"
                alt="FyndBo"
                width={150}
                height={90}
                className="h-12 w-auto"
                priority
              />

              <div>

                <p className="text-sm font-bold tracking-tight">
                  FyndBo
                </p>

                <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-slate-600">
                  Administration
                </p>

              </div>

            </Link>

          </div>

          <nav className="flex-1 overflow-y-auto px-4">

            {navigation.map(
              (group) => (
                <div
                  key={
                    group.title
                  }
                  className="mb-6"
                >

                  <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                    {group.title}
                  </p>

                  <div className="space-y-1">

                    {group.items.map(
                      (item) => {
                        const active =
                          activeSection ===
                          item.id

                        return (
                          <button
                            key={
                              item.id
                            }
                            type="button"
                            onClick={() =>
                              setActiveSection(
                                item.id
                              )
                            }
                            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                              active
                                ? 'border-blue-500/15 bg-blue-500/[0.09] text-blue-300'
                                : 'border-transparent text-slate-500 hover:bg-white/[0.035] hover:text-slate-200'
                            }`}
                          >
                            <Icon
                              name={
                                item.icon
                              }
                              className="h-[17px] w-[17px]"
                            />

                            <span className="flex-1">
                              {item.label}
                            </span>

                            {item.count !==
                              undefined && (
                              <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-slate-600">
                                {item.count}
                              </span>
                            )}

                          </button>
                        )
                      }
                    )}

                  </div>

                </div>
              )
            )}

          </nav>

          <div className="border-t border-white/[0.055] p-4">

            <div className="mb-2 rounded-xl bg-white/[0.025] p-3">

              <p className="truncate text-xs font-medium text-slate-300">
                {userEmail}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-wider text-slate-600">
                {isAdmin
                  ? 'Administratör'
                  : 'Mäklare'}
              </p>

            </div>

            <div className="grid grid-cols-2 gap-2">

              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Icon
                  name="external"
                  className="h-3.5 w-3.5"
                />

                Webb
              </Link>

              <button
                type="button"
                onClick={() =>
                  signOut({
                    callbackUrl:
                      '/admin/login',
                  })
                }
                className="flex items-center justify-center gap-2 rounded-lg border border-red-500/10 bg-red-500/[0.04] px-3 py-2 text-[11px] text-red-400 transition hover:bg-red-500/10"
              >
                <Icon
                  name="logout"
                  className="h-3.5 w-3.5"
                />

                Logga ut
              </button>

            </div>

          </div>

        </aside>

        {/* ====================================================
            MAIN
        ==================================================== */}

        <div className="min-w-0 flex-1">

          <header className="sticky top-0 z-40 border-b border-white/[0.055] bg-slate-950/90 backdrop-blur-xl">

            <div className="mx-auto flex min-h-20 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">

              <div>

                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                  {currentPage?.label ||
                    'FyndBo'}
                </h1>

                <p className="mt-1 hidden text-xs text-slate-600 sm:block">
                  {pageDescriptions[
                    activeSection
                  ]}
                </p>

              </div>

              <div className="flex items-center gap-2 lg:hidden">

                <Link
                  href="/"
                  target="_blank"
                  className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-2.5 text-slate-500"
                >
                  <Icon
                    name="external"
                    className="h-4 w-4"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    signOut({
                      callbackUrl:
                        '/admin/login',
                    })
                  }
                  className="rounded-lg border border-red-500/10 bg-red-500/[0.04] p-2.5 text-red-400"
                >
                  <Icon
                    name="logout"
                    className="h-4 w-4"
                  />
                </button>

              </div>

            </div>

            <div className="flex gap-1 overflow-x-auto border-t border-white/[0.045] px-3 py-2 lg:hidden">

              {allNavigationItems.map(
                (item) => (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        item.id
                      )
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                      activeSection ===
                      item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    <Icon
                      name={
                        item.icon
                      }
                      className="h-3.5 w-3.5"
                    />

                    {item.label}
                  </button>
                )
              )}

            </div>

          </header>

          <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">

            {/* ==================================================
                DASHBOARD
            ================================================== */}

            {activeSection ===
              'dashboard' && (
              <div className="space-y-7">

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

                  <StatCard
                    label="Bostäder"
                    value={
                      properties.length
                    }
                    detail={`${activeProperties.length} aktiva`}
                    icon="home"
                  />

                  <StatCard
                    label="Aktiva"
                    value={
                      activeProperties.length
                    }
                    detail="Visas publikt"
                    icon="check"
                  />

                  <StatCard
                    label="Inaktiva"
                    value={
                      inactiveProperties.length
                    }
                    detail="Dolda objekt"
                    icon="archive"
                  />

                  {isAdmin ? (
                    <StatCard
                      label="Prenumeranter"
                      value={
                        emails.length
                      }
                      detail={`${emailsToday} idag`}
                      icon="inbox"
                    />
                  ) : (
                    <StatCard
                      label="Kartposition"
                      value={
                        withCoordinates
                      }
                      detail={`${percentage(
                        withCoordinates,
                        properties.length
                      )}%`}
                      icon="map"
                    />
                  )}

                </div>

                <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">

                  <Panel
                    title="Senaste bostäder"
                    description="Senast tillagda objekt i systemet."
                    action={
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSection(
                            'properties'
                          )
                        }
                        className="text-xs font-medium text-blue-400"
                      >
                        Visa alla
                      </button>
                    }
                  >

                    {properties.length ===
                    0 ? (
                      <EmptyState
                        icon="home"
                        title="Inga bostäder"
                        description="Inga bostäder har lagts till."
                      />
                    ) : (
                      <div className="divide-y divide-white/[0.045]">

                        {properties
                          .slice(
                            0,
                            6
                          )
                          .map(
                            (
                              property
                            ) => (
                              <div
                                key={
                                  property.id
                                }
                                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                              >

                                <PropertyThumbnail
                                  property={
                                    property
                                  }
                                />

                                <div className="min-w-0 flex-1">

                                  <p className="truncate text-sm font-medium text-slate-200">
                                    {property.title}
                                  </p>

                                  <p className="mt-0.5 truncate text-[11px] text-slate-600">
                                    {[
                                      property.address,
                                      property.city,
                                    ]
                                      .filter(
                                        Boolean
                                      )
                                      .join(
                                        ', '
                                      ) ||
                                      'Adress saknas'}
                                  </p>

                                </div>

                                <StatusBadge
                                  active={
                                    property.is_active !==
                                    false
                                  }
                                />

                              </div>
                            )
                          )}

                      </div>
                    )}

                  </Panel>

                  <Panel
                    title="Datakvalitet"
                    description="Hur komplett bostadsinformationen är."
                  >

                    <div className="space-y-6">

                      <ProgressRow
                        label="Minst en bild"
                        value={percentage(
                          withImages,
                          properties.length
                        )}
                      />

                      <ProgressRow
                        label="Kartposition"
                        value={percentage(
                          withCoordinates,
                          properties.length
                        )}
                      />

                      <ProgressRow
                        label="Extern annons"
                        value={percentage(
                          withListingUrl,
                          properties.length
                        )}
                      />

                    </div>

                  </Panel>

                </div>

                {isAdmin && (
                  <div className="grid gap-5 lg:grid-cols-2">

                    <Panel
                      title="Prenumeranter"
                      description="Aktivitet i intresselistan."
                    >

                      <div className="grid grid-cols-3 gap-3">

                        <SmallStat
                          label="Totalt"
                          value={
                            emails.length
                          }
                        />

                        <SmallStat
                          label="Idag"
                          value={
                            emailsToday
                          }
                        />

                        <SmallStat
                          label="7 dagar"
                          value={
                            emailsThisWeek
                          }
                        />

                      </div>

                    </Panel>

                    <Panel
                      title="Snabbåtgärder"
                      description="Vanliga saker du gör i adminpanelen."
                    >

                      <div className="grid grid-cols-2 gap-3">

                        <QuickAction
                          icon="plus"
                          label="Ny bostad"
                          onClick={() => {
                            setActiveSection(
                              'properties'
                            )

                            openNewProperty()
                          }}
                        />

                        <QuickAction
                          icon="send"
                          label="Nytt utskick"
                          onClick={() =>
                            setActiveSection(
                              'newsletter'
                            )
                          }
                        />

                        <QuickAction
                          icon="users"
                          label="Användare"
                          onClick={() =>
                            setActiveSection(
                              'admins'
                            )
                          }
                        />

                        <QuickAction
                          icon="analytics"
                          label="Datakvalitet"
                          onClick={() =>
                            setActiveSection(
                              'analytics'
                            )
                          }
                        />

                      </div>

                    </Panel>

                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                PROPERTIES
            ================================================== */}

            {activeSection ===
              'properties' && (
              <div className="space-y-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <h2 className="text-xl font-semibold">
                      {isMaklare
                        ? 'Mina bostäder'
                        : 'Alla bostäder'}
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                      {activeProperties.length}{' '}
                      aktiva ·{' '}
                      {inactiveProperties.length}{' '}
                      inaktiva
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      openNewProperty
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
                  >
                    <Icon
                      name="plus"
                      className="h-4 w-4"
                    />

                    Lägg till bostad
                  </button>

                </div>

                <div className={`${cardClass} p-3`}>

                  <div className="grid gap-2 md:grid-cols-[1fr_230px]">

                    <div className="relative">

                      <Icon
                        name="search"
                        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                      />

                      <input
                        value={
                          propertySearch
                        }
                        onChange={(
                          event
                        ) =>
                          setPropertySearch(
                            event.target
                              .value
                          )
                        }
                        placeholder="Sök titel, adress, ort, bostadstyp eller ägare..."
                        className={`${inputClass} pl-10`}
                      />

                    </div>

                    <CustomSelect
                      value={
                        propertyStatus
                      }
                      options={
                        STATUS_OPTIONS
                      }
                      onChange={(
                        value
                      ) =>
                        setPropertyStatus(
                          value as PropertyStatus
                        )
                      }
                    />

                  </div>

                </div>

                {filteredProperties.length ===
                0 ? (
                  <div className={`${cardClass} p-8`}>

                    <EmptyState
                      icon="search"
                      title="Inga bostäder hittades"
                      description="Prova en annan sökning eller ett annat statusfilter."
                    />

                  </div>
                ) : (
                  <div className="grid gap-3">

                    {filteredProperties.map(
                      (
                        property
                      ) => (
                        <PropertyAdminCard
                          key={
                            property.id
                          }
                          property={
                            property
                          }
                          isAdmin={
                            isAdmin
                          }
                          busy={
                            changingStatusId ===
                              property.id ||
                            deletingPropertyId ===
                              property.id
                          }
                          onEdit={() =>
                            openEditProperty(
                              property
                            )
                          }
                          onStatus={() =>
                            changePropertyStatus(
                              property,
                              property.is_active ===
                                false
                            )
                          }
                          onDelete={() =>
                            permanentlyDeleteProperty(
                              property
                            )
                          }
                        />
                      )
                    )}

                  </div>
                )}

              </div>
            )}

            {/* ==================================================
                SUBSCRIBERS
            ================================================== */}

            {activeSection ===
              'subscribers' &&
              isAdmin && (
              <div className="space-y-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <h2 className="text-xl font-semibold">
                      Prenumeranter
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                      Personer som har anmält sitt intresse för FyndBo.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      exportCSV
                    }
                    disabled={
                      emails.length ===
                      0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-2.5 text-xs font-medium text-emerald-400 disabled:opacity-40"
                  >
                    <Icon
                      name="download"
                      className="h-4 w-4"
                    />

                    Exportera CSV
                  </button>

                </div>

                <div className="grid grid-cols-3 gap-3">

                  <SmallStat
                    label="Totalt"
                    value={
                      emails.length
                    }
                  />

                  <SmallStat
                    label="Idag"
                    value={
                      emailsToday
                    }
                  />

                  <SmallStat
                    label="7 dagar"
                    value={
                      emailsThisWeek
                    }
                  />

                </div>

                <div className={`${cardClass} overflow-hidden`}>

                  {emails.length ===
                  0 ? (
                    <div className="p-8">

                      <EmptyState
                        icon="inbox"
                        title="Inga prenumeranter"
                        description="Nya intresseanmälningar visas här."
                      />

                    </div>
                  ) : (
                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[650px]">

                        <thead className="border-b border-white/[0.055] bg-white/[0.02]">

                          <tr>

                            <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                              E-post
                            </th>

                            <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                              Registrerad
                            </th>

                            <th className="px-5 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                              Åtgärd
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {emails.map(
                            (
                              entry
                            ) => (
                              <tr
                                key={
                                  entry.id
                                }
                                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                              >

                                <td className="px-5 py-4 text-sm font-medium text-slate-300">
                                  {entry.email}
                                </td>

                                <td className="px-5 py-4 text-xs text-slate-600">
                                  {formatDate(
                                    entry.created_at
                                  )}
                                </td>

                                <td className="px-5 py-4 text-right">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteSubscriber(
                                        entry
                                      )
                                    }
                                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                                  >
                                    <Icon
                                      name="trash"
                                      className="h-4 w-4"
                                    />
                                  </button>

                                </td>

                              </tr>
                            )
                          )}

                        </tbody>

                      </table>

                    </div>
                  )}

                </div>

              </div>
            )}

            {/* ==================================================
                USERS
            ================================================== */}

            {activeSection ===
              'admins' &&
              isAdmin && (
              <div className="space-y-5">

                <div>

                  <h2 className="text-xl font-semibold">
                    Användare
                  </h2>

                  <p className="mt-1 text-xs text-slate-600">
                    Administratörer och mäklarkonton.
                  </p>

                </div>

                <Panel
                  title="Lägg till användare"
                  description="Lösenord är valfritt. Konton utan lösenord kan använda Google-inloggning."
                >

                  <div className="grid gap-3 lg:grid-cols-[1fr_1fr_240px_auto]">

                    <input
                      type="email"
                      value={
                        newAdminEmail
                      }
                      onChange={(
                        event
                      ) =>
                        setNewAdminEmail(
                          event.target
                            .value
                        )
                      }
                      placeholder="E-postadress"
                      className={
                        inputClass
                      }
                    />

                    <input
                      type="password"
                      value={
                        newAdminPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setNewAdminPassword(
                          event.target
                            .value
                        )
                      }
                      placeholder="Lösenord, valfritt"
                      className={
                        inputClass
                      }
                    />

                    <CustomSelect
                      value={
                        newAdminRole
                      }
                      options={
                        ROLE_OPTIONS
                      }
                      onChange={(
                        value
                      ) =>
                        setNewAdminRole(
                          value as
                            | 'admin'
                            | 'maklare'
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={
                        handleAddAdmin
                      }
                      disabled={
                        addingAdmin
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                      <Icon
                        name="plus"
                        className="h-4 w-4"
                      />

                      {addingAdmin
                        ? 'Lägger till'
                        : 'Lägg till'}
                    </button>

                  </div>

                </Panel>

                <div className={`${cardClass} overflow-hidden`}>

                  {admins.length ===
                  0 ? (
                    <div className="p-8">

                      <EmptyState
                        icon="users"
                        title="Inga användare"
                        description="Lägg till en användare ovan."
                      />

                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.045]">

                      {admins.map(
                        (
                          admin
                        ) => (
                          <div
                            key={
                              admin.id
                            }
                            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                          >

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/[0.08] text-blue-400">

                              <Icon
                                name="users"
                                className="h-4 w-4"
                              />

                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-sm font-medium text-slate-300">
                                {admin.email}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-600">
                                {admin.role ===
                                'maklare'
                                  ? 'Mäklare'
                                  : 'Administratör'}
                                {' · '}
                                {admin.has_password
                                  ? 'Lösenordsinloggning'
                                  : 'Google-inloggning'}
                              </p>

                            </div>

                            <p className="hidden text-[10px] text-slate-700 md:block">
                              {formatDate(
                                admin.created_at
                              )}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                deleteAdmin(
                                  admin
                                )
                              }
                              disabled={
                                deletingAdminId ===
                                  admin.id ||
                                admin.email.toLowerCase() ===
                                  userEmail.toLowerCase()
                              }
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:opacity-20"
                            >
                              <Icon
                                name="trash"
                                className="h-4 w-4"
                              />
                            </button>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

              </div>
            )}

            {/* ==================================================
                NEWSLETTER
            ================================================== */}

            {activeSection ===
              'newsletter' &&
              isAdmin && (
              <div className="space-y-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <h2 className="text-xl font-semibold">
                      Nyhetsbrev
                    </h2>

                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">
                      Bygg ett färdigt FyndBo-mail utan HTML. Välj mall, ändra innehållet och se resultatet direkt.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      fetchBrevoLists
                    }
                    disabled={
                      loadingBrevo
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-xs text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <Icon
                      name="refresh"
                      className={`h-3.5 w-3.5 ${
                        loadingBrevo
                          ? 'animate-spin'
                          : ''
                      }`}
                    />

                    Uppdatera listor
                  </button>

                </div>

                {/* TEMPLATE CARDS */}

                <section>

                  <div className="mb-3">

                    <p className="text-xs font-semibold text-slate-300">
                      Välj typ av utskick
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      Du kan ändra all text efter att mallen har valts.
                    </p>

                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

                    {Object.entries(
                      NEWSLETTER_TEMPLATES
                    ).map(
                      ([
                        key,
                        template,
                      ]) => {
                        const active =
                          selectedTemplate ===
                          key

                        return (
                          <button
                            key={
                              key
                            }
                            type="button"
                            onClick={() =>
                              loadNewsletterTemplate(
                                key
                              )
                            }
                            className={`rounded-2xl border p-4 text-left transition ${
                              active
                                ? 'border-blue-500/30 bg-blue-500/[0.07]'
                                : 'border-white/[0.07] bg-white/[0.025] hover:border-white/[0.13] hover:bg-white/[0.04]'
                            }`}
                          >

                            <div className="flex items-start justify-between">

                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                  active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/[0.04] text-slate-500'
                                }`}
                              >
                                <Icon
                                  name="mail"
                                  className="h-4 w-4"
                                />
                              </div>

                              {active && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">

                                  <Icon
                                    name="check"
                                    className="h-3 w-3"
                                  />

                                </div>
                              )}

                            </div>

                            <p className="mt-4 text-sm font-semibold text-slate-200">
                              {template.name}
                            </p>

                            <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
                              {template.description}
                            </p>

                          </button>
                        )
                      }
                    )}

                  </div>

                </section>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_530px]">

                  {/* EDITOR */}

                  <div className="space-y-5">

                    <Panel
                      title="Mottagare"
                      description="Välj vilken Brevo-lista som ska få utskicket."
                    >

                      {brevoLists.length ===
                      0 ? (
                        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.05] p-4">

                          <div className="flex gap-3">

                            <Icon
                              name="warning"
                              className="mt-0.5 h-4 w-4 text-amber-400"
                            />

                            <div>

                              <p className="text-xs font-medium text-amber-300">
                                Ingen mottagarlista hittades
                              </p>

                              <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
                                Kontrollera Brevo-kopplingen och att en lista finns skapad.
                              </p>

                            </div>

                          </div>

                        </div>
                      ) : (
                        <CustomSelect
                          value={
                            selectedBrevoList
                          }
                          options={brevoLists.map(
                            (
                              list
                            ) => ({
                              value:
                                String(
                                  list.id
                                ),

                              label:
                                list.name,

                              description:
                                list.totalSubscribers !==
                                undefined
                                  ? `${list.totalSubscribers} prenumeranter`
                                  : 'Brevo-lista',
                            })
                          )}
                          onChange={
                            setSelectedBrevoList
                          }
                        />
                      )}

                    </Panel>

                    <Panel
                      title="Mailinformation"
                      description="Ämnesraden och förhandsraden syns redan i mottagarens inkorg."
                    >

                      <div className="space-y-4">

                        <Field label="Ämnesrad">

                          <input
                            value={
                              newsletterSubject
                            }
                            onChange={(
                              event
                            ) =>
                              setNewsletterSubject(
                                event.target
                                  .value
                              )
                            }
                            className={
                              inputClass
                            }
                          />

                        </Field>

                        <Field label="Förhandsrad">

                          <input
                            value={
                              newsletterPreheader
                            }
                            onChange={(
                              event
                            ) =>
                              setNewsletterPreheader(
                                event.target
                                  .value
                              )
                            }
                            className={
                              inputClass
                            }
                          />

                          <p className="mt-1.5 text-[10px] text-slate-700">
                            Den korta texten som många mailappar visar efter ämnesraden.
                          </p>

                        </Field>

                      </div>

                    </Panel>

                    <Panel
                      title="Innehåll"
                      description="Det viktigaste innehållet i utskicket."
                    >

                      <div className="space-y-4">

                        <Field label="Stor rubrik">

                          <input
                            value={
                              newsletterHeading
                            }
                            onChange={(
                              event
                            ) =>
                              setNewsletterHeading(
                                event.target
                                  .value
                              )
                            }
                            className={
                              inputClass
                            }
                          />

                        </Field>

                        <Field label="Meddelande">

                          <textarea
                            rows={11}
                            value={
                              newsletterMessage
                            }
                            onChange={(
                              event
                            ) =>
                              setNewsletterMessage(
                                event.target
                                  .value
                              )
                            }
                            className={`${inputClass} resize-y leading-6`}
                          />

                        </Field>

                      </div>

                    </Panel>

                    <Panel
                      title="Hero-bild"
                      description="Stor bakgrundsbild högst upp i mailet."
                    >

                      <Field label="Bildadress">

                        <div className="relative">

                          <Icon
                            name="image"
                            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                          />

                          <input
                            type="url"
                            value={
                              newsletterHeroUrl
                            }
                            onChange={(
                              event
                            ) =>
                              setNewsletterHeroUrl(
                                event.target
                                  .value
                              )
                            }
                            className={`${inputClass} pl-10`}
                          />

                        </div>

                      </Field>

                      <p className="mt-2 text-[10px] leading-relaxed text-slate-700">
                        Rekommenderat: lägg bilden som
                        <span className="text-slate-500">
                          {' '}
                          public/email-house.jpg
                        </span>
                        {' '}
                        så att adressen blir https://fyndbo.se/email-house.jpg.
                      </p>

                    </Panel>

                    <Panel
                      title="Knapp"
                      description="Knappen leder mottagaren vidare till FyndBo."
                    >

                      <div className="grid gap-3 sm:grid-cols-2">

                        <Field label="Knapptext">

                          <input
                            value={
                              newsletterCtaLabel
                            }
                            onChange={(
                              event
                            ) =>
                              setNewsletterCtaLabel(
                                event.target
                                  .value
                              )
                            }
                            className={
                              inputClass
                            }
                          />

                        </Field>

                        <Field label="Länk">

                          <div className="relative">

                            <Icon
                              name="link"
                              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                            />

                            <input
                              type="url"
                              value={
                                newsletterCtaUrl
                              }
                              onChange={(
                                event
                              ) =>
                                setNewsletterCtaUrl(
                                  event.target
                                    .value
                                )
                              }
                              className={`${inputClass} pl-10`}
                            />

                          </div>

                        </Field>

                      </div>

                    </Panel>

                    <Panel
                      title="Skicka"
                      description="Skicka helst ett test till dig själv innan hela listan."
                    >

                      <div className="space-y-4">

                        <Field label="Testadress">

                          <input
                            type="email"
                            value={
                              newsletterTestEmail
                            }
                            onChange={(
                              event
                            ) =>
                              setNewsletterTestEmail(
                                event.target
                                  .value
                              )
                            }
                            placeholder="din@email.se"
                            className={
                              inputClass
                            }
                          />

                        </Field>

                        <button
                          type="button"
                          onClick={
                            sendNewsletter
                          }
                          disabled={
                            sendingNewsletter ||
                            !selectedBrevoList ||
                            !newsletterSubject.trim() ||
                            !newsletterHeading.trim() ||
                            !newsletterMessage.trim()
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Icon
                            name="send"
                            className="h-4 w-4"
                          />

                          {sendingNewsletter
                            ? 'Skickar...'
                            : newsletterTestEmail
                              ? 'Skicka testmail'
                              : 'Skicka nyhetsbrev'}
                        </button>

                        {newsletterTestEmail && (
                          <p className="text-center text-[10px] text-slate-600">
                            Eftersom en testadress är ifylld skickas mailet bara dit.
                          </p>
                        )}

                      </div>

                    </Panel>

                  </div>

                  {/* PREVIEW */}

                  <div className="xl:sticky xl:top-28 xl:self-start">

                    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827] shadow-2xl shadow-black/20">

                      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">

                        <div className="flex items-center gap-2">

                          <Icon
                            name="eye"
                            className="h-4 w-4 text-slate-500"
                          />

                          <p className="text-xs font-medium text-slate-300">
                            Förhandsvisning
                          </p>

                        </div>

                        <span className="rounded-md bg-white/[0.04] px-2 py-1 text-[9px] uppercase tracking-wider text-slate-600">
                          Mail
                        </span>

                      </div>

                      <div className="border-b border-white/[0.06] bg-white/[0.02] p-4">

                        <div className="grid grid-cols-[55px_1fr] gap-y-2 text-[10px]">

                          <span className="text-slate-600">
                            Från
                          </span>

                          <span className="text-slate-300">
                            FyndBo.se
                          </span>

                          <span className="text-slate-600">
                            Ämne
                          </span>

                          <span className="truncate font-medium text-white">
                            {newsletterSubject ||
                              'Ingen ämnesrad'}
                          </span>

                        </div>

                      </div>

                      <iframe
                        title="Förhandsvisning av nyhetsbrev"
                        sandbox=""
                        srcDoc={
                          newsletterHtml
                        }
                        className="h-[760px] w-full bg-[#e8edf4]"
                      />

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* ==================================================
                ANALYTICS
            ================================================== */}

            {activeSection ===
              'analytics' &&
              isAdmin && (
              <div className="space-y-6">

                <div>

                  <h2 className="text-xl font-semibold">
                    Datakvalitet
                  </h2>

                  <p className="mt-1 text-xs text-slate-600">
                    Statistik som faktiskt bygger på datan i bostadsannonserna.
                  </p>

                </div>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

                  <StatCard
                    label="Aktiva"
                    value={
                      activeProperties.length
                    }
                    detail="Publicerade"
                    icon="check"
                  />

                  <StatCard
                    label="Inaktiva"
                    value={
                      inactiveProperties.length
                    }
                    detail="Dolda"
                    icon="archive"
                  />

                  <StatCard
                    label="Med bilder"
                    value={
                      withImages
                    }
                    detail={`${percentage(
                      withImages,
                      properties.length
                    )}%`}
                    icon="image"
                  />

                  <StatCard
                    label="Med karta"
                    value={
                      withCoordinates
                    }
                    detail={`${percentage(
                      withCoordinates,
                      properties.length
                    )}%`}
                    icon="map"
                  />

                </div>

                <Panel
                  title="Annonsinformation"
                  description="Hur komplett informationen är för alla objekt."
                >

                  <div className="space-y-6">

                    <ProgressRow
                      label="Minst en bild"
                      value={percentage(
                        withImages,
                        properties.length
                      )}
                    />

                    <ProgressRow
                      label="Kartposition"
                      value={percentage(
                        withCoordinates,
                        properties.length
                      )}
                    />

                    <ProgressRow
                      label="Extern annonslänk"
                      value={percentage(
                        withListingUrl,
                        properties.length
                      )}
                    />

                  </div>

                </Panel>

              </div>
            )}

          </main>

        </div>

      </div>

    </div>
  )
}

// ============================================================
// PROPERTY EDITOR
// ============================================================

function PropertyEditor({
  form,
  setForm,
  editing,
  uploading,
  geocoding,
  saving,
  onClose,
  onUpload,
  onRemoveImage,
  onGeocode,
  onSave,
}: {
  form: PropertyForm

  setForm:
    Dispatch<
      SetStateAction<PropertyForm>
    >

  editing:
    Property | null

  uploading:
    boolean

  geocoding:
    boolean

  saving:
    boolean

  onClose:
    () => void

  onUpload:
    (files: File[]) => void

  onRemoveImage:
    (index: number) => void

  onGeocode:
    () => void

  onSave:
    () => void
}) {
  useEffect(() => {
    document.body.style.overflow =
      'hidden'

    return () => {
      document.body.style.overflow =
        ''
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm">

      <div className="absolute inset-0 overflow-y-auto">

        <div className="mx-auto max-w-6xl p-2 sm:p-5">

          <div className="flex min-h-[calc(100vh-16px)] flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-slate-950 shadow-2xl sm:min-h-[calc(100vh-40px)]">

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-slate-950/95 px-5 py-4 backdrop-blur-xl">

              <div>

                <p className="text-sm font-semibold">
                  {editing
                    ? 'Redigera bostad'
                    : 'Ny bostad'}
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  {editing
                    ? `Objekt #${editing.id}`
                    : 'Skapa en ny bostadsannons'}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  onClose
                }
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-2 text-slate-500 hover:text-white"
              >
                <Icon
                  name="close"
                  className="h-4 w-4"
                />
              </button>

            </div>

            <div className="flex-1 space-y-8 p-5 sm:p-7">

              <EditorSection
                title="Grunduppgifter"
                description="Informationen som syns tydligast i bostadssökningen."
              >

                <div className="grid gap-4 md:grid-cols-2">

                  <Field
                    label="Titel"
                    className="md:col-span-2"
                  >

                    <input
                      value={
                        form.title
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          title:
                            event.target
                              .value,
                        })
                      }
                      placeholder="Modern villa nära centrum"
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Pris">

                    <input
                      type="number"
                      min="0"
                      value={
                        form.price
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          price:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Bostadstyp">

                    <CustomSelect
                      value={
                        form.property_type
                      }
                      options={
                        PROPERTY_TYPE_OPTIONS
                      }
                      onChange={(
                        value
                      ) =>
                        setForm({
                          ...form,

                          property_type:
                            value,
                        })
                      }
                    />

                  </Field>

                  <Field label="Boarea">

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={
                        form.area
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          area:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Antal rum">

                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={
                        form.rooms
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          rooms:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field
                    label="Beskrivning"
                    className="md:col-span-2"
                  >

                    <textarea
                      rows={7}
                      value={
                        form.description
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          description:
                            event.target
                              .value,
                        })
                      }
                      className={`${inputClass} resize-y leading-6`}
                    />

                  </Field>

                </div>

              </EditorSection>

              <EditorSection
                title="Adress och karta"
                description="Använd adressen för att placera objektet på kartan."
              >

                <div className="grid gap-4 md:grid-cols-3">

                  <Field
                    label="Adress"
                    className="md:col-span-2"
                  >

                    <input
                      value={
                        form.address
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          address:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Postnummer">

                    <input
                      value={
                        form.postal_code
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          postal_code:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Ort">

                    <input
                      value={
                        form.city
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          city:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Latitude">

                    <input
                      value={
                        form.latitude
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          latitude:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Longitude">

                    <input
                      value={
                        form.longitude
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          longitude:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                </div>

                <button
                  type="button"
                  onClick={
                    onGeocode
                  }
                  disabled={
                    geocoding
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.07] px-4 py-2.5 text-xs font-medium text-indigo-300 disabled:opacity-50"
                >
                  <Icon
                    name="map"
                    className="h-4 w-4"
                  />

                  {geocoding
                    ? 'Söker adress...'
                    : 'Hämta koordinater'}
                </button>

              </EditorSection>

              <EditorSection
                title="Ekonomi och bostadsfakta"
                description="Kompletterande information om bostaden."
              >

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <Field label="Månadsavgift">

                    <input
                      type="number"
                      min="0"
                      value={
                        form.monthly_fee
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          monthly_fee:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Driftkostnad / år">

                    <input
                      type="number"
                      min="0"
                      value={
                        form.operating_cost
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          operating_cost:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Våning">

                    <input
                      value={
                        form.floor
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          floor:
                            event.target
                              .value,
                        })
                      }
                      placeholder="3 av 5"
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Byggår">

                    <input
                      type="number"
                      value={
                        form.construction_year
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          construction_year:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Tomtarea">

                    <input
                      type="number"
                      min="0"
                      value={
                        form.plot_area
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          plot_area:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Energiklass">

                    <CustomSelect
                      value={
                        form.energy_class
                      }
                      options={
                        ENERGY_OPTIONS
                      }
                      onChange={(
                        value
                      ) =>
                        setForm({
                          ...form,

                          energy_class:
                            value,
                        })
                      }
                    />

                  </Field>

                  <Field
                    label="Förening"
                    className="lg:col-span-2"
                  >

                    <input
                      value={
                        form.association
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          association:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                </div>

                <div className="mt-4 flex flex-wrap gap-3">

                  <Toggle
                    label="Hiss"
                    checked={
                      form.elevator
                    }
                    onChange={(
                      value
                    ) =>
                      setForm({
                        ...form,

                        elevator:
                          value,
                      })
                    }
                  />

                  <Toggle
                    label="Balkong"
                    checked={
                      form.balcony
                    }
                    onChange={(
                      value
                    ) =>
                      setForm({
                        ...form,

                        balcony:
                          value,
                      })
                    }
                  />

                </div>

              </EditorSection>

              <EditorSection
                title="Bilder"
                description="Första bilden används som huvudbild."
              >

                <label
                  className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.015] p-6 text-center transition hover:border-blue-500/25 hover:bg-blue-500/[0.025]"
                  onDragOver={(
                    event
                  ) =>
                    event.preventDefault()
                  }
                  onDrop={(
                    event
                  ) => {
                    event.preventDefault()

                    onUpload(
                      Array.from(
                        event.dataTransfer
                          .files
                      )
                    )
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.035] text-slate-500">

                    <Icon
                      name="upload"
                      className="h-5 w-5"
                    />

                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-400">
                    {uploading
                      ? 'Laddar upp bilder...'
                      : 'Dra bilder hit eller klicka'}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-700">
                    Du kan välja flera bilder samtidigt.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={
                      uploading
                    }
                    className="hidden"
                    onChange={(
                      event
                    ) => {
                      if (
                        event.target
                          .files
                      ) {
                        onUpload(
                          Array.from(
                            event.target
                              .files
                          )
                        )
                      }

                      event.target.value =
                        ''
                    }}
                  />

                </label>

                {form.images.length >
                  0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">

                    {form.images.map(
                      (
                        url,
                        index
                      ) => (
                        <div
                          key={`${url}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.07] bg-slate-900"
                        >

                          <img
                            src={
                              url
                            }
                            alt={`Bostadsbild ${index + 1}`}
                            className="h-full w-full object-cover"
                          />

                          {index ===
                            0 && (
                            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-blue-600 px-1.5 py-0.5 text-[8px] font-medium text-white">
                              Huvudbild
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              onRemoveImage(
                                index
                              )
                            }
                            className="absolute right-1.5 top-1.5 rounded-lg bg-slate-950/80 p-1.5 text-red-400 backdrop-blur transition hover:bg-red-600 hover:text-white"
                          >
                            <Icon
                              name="trash"
                              className="h-3 w-3"
                            />
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

              </EditorSection>

              <EditorSection
                title="Extern annons"
                description="Länka vidare till bostadens ursprungliga mäklarannons."
              >

                <div className="grid gap-4 md:grid-cols-2">

                  <Field label="Annonslänk">

                    <input
                      type="url"
                      value={
                        form.listing_url
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          listing_url:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Huvudbild URL">

                    <input
                      type="url"
                      value={
                        form.image_url
                      }
                      onChange={(
                        event
                      ) =>
                        setForm({
                          ...form,

                          image_url:
                            event.target
                              .value,
                        })
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                </div>

              </EditorSection>

            </div>

            <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-2 border-t border-white/[0.06] bg-slate-950/95 px-5 py-4 backdrop-blur-xl sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  onClose
                }
                disabled={
                  saving
                }
                className="rounded-xl px-5 py-2.5 text-sm text-slate-500 hover:bg-white/[0.04] hover:text-white"
              >
                Avbryt
              </button>

              <button
                type="button"
                onClick={
                  onSave
                }
                disabled={
                  saving
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                <Icon
                  name="check"
                  className="h-4 w-4"
                />

                {saving
                  ? 'Sparar...'
                  : editing
                    ? 'Spara ändringar'
                    : 'Publicera bostad'}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

// ============================================================
// PROPERTY CARD
// ============================================================

function PropertyAdminCard({
  property,
  isAdmin,
  busy,
  onEdit,
  onStatus,
  onDelete,
}: {
  property: Property
  isAdmin: boolean
  busy: boolean
  onEdit: () => void
  onStatus: () => void
  onDelete: () => void
}) {
  const active =
    property.is_active !==
    false

  const image =
    property.images?.[0] ||
    property.image_url

  return (
    <div className={`${cardClass} overflow-hidden transition hover:border-white/[0.11]`}>

      <div className="flex flex-col sm:flex-row">

        <div className="relative h-44 shrink-0 bg-slate-900 sm:h-auto sm:w-52">

          {image ? (
            <img
              src={
                image
              }
              alt={
                property.title
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-40 items-center justify-center text-slate-800">

              <Icon
                name="image"
                className="h-7 w-7"
              />

            </div>
          )}

          <div className="absolute left-3 top-3">

            <StatusBadge
              active={
                active
              }
            />

          </div>

        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="truncate text-base font-semibold text-slate-200">
                {property.title}
              </h3>

              {property.property_type && (
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[9px] capitalize text-slate-600">
                  {property.property_type}
                </span>
              )}

            </div>

            <p className="mt-1 truncate text-[11px] text-slate-600">
              {[
                property.address,
                property.postal_code,
                property.city,
              ]
                .filter(Boolean)
                .join(', ') ||
                'Adress saknas'}
            </p>

            <p className="mt-4 text-xl font-bold tracking-tight">
              {formatPrice(
                property.price
              )}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">

              {property.area !=
                null && (
                <span>
                  {property.area} m²
                </span>
              )}

              {property.rooms !=
                null && (
                <span>
                  {property.rooms}{' '}
                  rum
                </span>
              )}

              {property.latitude !=
                null &&
                property.longitude !=
                  null && (
                  <span className="text-emerald-500">
                    Kartposition klar
                  </span>
                )}

            </div>

            {property.created_by && (
              <p className="mt-4 truncate text-[9px] text-slate-700">
                Skapad av{' '}
                {property.created_by}
              </p>
            )}

          </div>

          <div className="mt-4 flex flex-wrap gap-1 border-t border-white/[0.045] pt-3">

            {active && (
              <Link
                href={`/bostader/${property.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] text-slate-500 hover:bg-white/[0.04] hover:text-white"
              >
                <Icon
                  name="eye"
                  className="h-3.5 w-3.5"
                />

                Visa
              </Link>
            )}

            <button
              type="button"
              onClick={
                onEdit
              }
              disabled={
                busy
              }
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] text-amber-400 hover:bg-amber-500/[0.07] disabled:opacity-40"
            >
              <Icon
                name="edit"
                className="h-3.5 w-3.5"
              />

              Redigera
            </button>

            <button
              type="button"
              onClick={
                onStatus
              }
              disabled={
                busy
              }
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] disabled:opacity-40 ${
                active
                  ? 'text-orange-400 hover:bg-orange-500/[0.07]'
                  : 'text-emerald-400 hover:bg-emerald-500/[0.07]'
              }`}
            >
              <Icon
                name={
                  active
                    ? 'archive'
                    : 'restore'
                }
                className="h-3.5 w-3.5"
              />

              {active
                ? 'Inaktivera'
                : 'Återaktivera'}
            </button>

            {isAdmin &&
              !active && (
              <button
                type="button"
                onClick={
                  onDelete
                }
                disabled={
                  busy
                }
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] text-red-500 hover:bg-red-500/[0.08] disabled:opacity-40"
              >
                <Icon
                  name="trash"
                  className="h-3.5 w-3.5"
                />

                Radera permanent
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}

// ============================================================
// GENERIC UI
// ============================================================

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className={`${cardClass} p-5 sm:p-6`}>

      <div className="mb-5 flex items-start justify-between gap-4">

        <div>

          <h3 className="text-sm font-semibold text-slate-200">
            {title}
          </h3>

          {description && (
            <p className="mt-1 text-[10px] leading-relaxed text-slate-600">
              {description}
            </p>
          )}

        </div>

        {action}

      </div>

      {children}

    </section>
  )
}

function EditorSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section>

      <div className="mb-4 border-b border-white/[0.05] pb-3">

        <h3 className="text-sm font-semibold text-slate-200">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-[10px] text-slate-600">
            {description}
          </p>
        )}

      </div>

      {children}

    </section>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>

      <label className={labelClass}>
        {label}
      </label>

      {children}

    </div>
  )
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string
  value: number
  detail: string
  icon: IconName
}) {
  return (
    <div className={`${cardClass} p-4 sm:p-5`}>

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-slate-700">
            {detail}
          </p>

        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/[0.07] text-blue-400">

          <Icon
            name={
              icon
            }
            className="h-4 w-4"
          />

        </div>

      </div>

    </div>
  )
}

function SmallStat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">

      <p className="text-[9px] uppercase tracking-[0.12em] text-slate-700">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-200">
        {value}
      </p>

    </div>
  )
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: IconName
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex items-center gap-3 rounded-xl border border-white/[0.055] bg-white/[0.02] p-3 text-left hover:border-blue-500/15 hover:bg-blue-500/[0.035]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/[0.07] text-blue-400">

        <Icon
          name={
            icon
          }
          className="h-3.5 w-3.5"
        />

      </div>

      <span className="text-xs font-medium text-slate-400">
        {label}
      </span>

    </button>
  )
}

function ProgressRow({
  label,
  value,
}: {
  label: string
  value: number
}) {
  const safeValue =
    Math.max(
      0,
      Math.min(
        100,
        value
      )
    )

  return (
    <div>

      <div className="mb-2 flex justify-between">

        <span className="text-[11px] text-slate-500">
          {label}
        </span>

        <span className="text-[11px] font-semibold text-slate-300">
          {safeValue}%
        </span>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">

        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${safeValue}%`,
          }}
        />

      </div>

    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (
    value: boolean
  ) => void
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          !checked
        )
      }
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-medium ${
        checked
          ? 'border-blue-500/25 bg-blue-500/[0.07] text-blue-300'
          : 'border-white/[0.07] bg-white/[0.02] text-slate-500'
      }`}
    >
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
          checked
            ? 'border-blue-500 bg-blue-600'
            : 'border-white/[0.1]'
        }`}
      >
        {checked && (
          <Icon
            name="check"
            className="h-3 w-3 text-white"
          />
        )}
      </div>

      {label}
    </button>
  )
}

function PropertyThumbnail({
  property,
}: {
  property: Property
}) {
  const image =
    property.images?.[0] ||
    property.image_url

  return (
    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-900">

      {image ? (
        <img
          src={
            image
          }
          alt={
            property.title
          }
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-800">

          <Icon
            name="image"
            className="h-4 w-4"
          />

        </div>
      )}

    </div>
  )
}

function StatusBadge({
  active,
}: {
  active: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-medium ${
        active
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-slate-500/10 text-slate-500'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? 'bg-emerald-400'
            : 'bg-slate-600'
        }`}
      />

      {active
        ? 'Aktiv'
        : 'Inaktiv'}
    </span>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: IconName
  title: string
  description: string
}) {
  return (
    <div className="py-6 text-center">

      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.025] text-slate-700">

        <Icon
          name={
            icon
          }
          className="h-5 w-5"
        />

      </div>

      <p className="mt-3 text-xs font-medium text-slate-400">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-xs text-[10px] leading-relaxed text-slate-700">
        {description}
      </p>

    </div>
  )
}

function Toast({
  type,
  text,
}: {
  type:
    | 'success'
    | 'error'

  text: string
}) {
  return (
    <div
      className={`fixed right-4 top-4 z-[150] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-xs text-white shadow-2xl backdrop-blur-xl ${
        type === 'success'
          ? 'border-emerald-400/20 bg-emerald-600/95'
          : 'border-red-400/20 bg-red-600/95'
      }`}
    >
      <Icon
        name={
          type === 'success'
            ? 'check'
            : 'warning'
        }
        className="h-4 w-4 shrink-0"
      />

      {text}
    </div>
  )
}

// ============================================================
// FORMAT
// ============================================================

function percentage(
  value: number,
  total: number
) {
  if (!total) {
    return 0
  }

  return Math.round(
    (value / total) *
      100
  )
}

function formatPrice(
  price: number
) {
  return (
    new Intl.NumberFormat(
      'sv-SE'
    ).format(price) +
    ' kr'
  )
}

function formatDate(
  value: string
) {
  if (!value) {
    return '—'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'sv-SE',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    }
  ).format(date)
}