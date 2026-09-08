import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// ============================================================
// TYPER
// ============================================================

type ManagerRole = 'admin' | 'maklare'

interface ManagerToken {
  role: ManagerRole
  email: string
}

// ============================================================
// RESPONSE
// ============================================================

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

// ============================================================
// AUTH
// ============================================================

async function getManagerToken(
  request: NextRequest
): Promise<ManagerToken | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return null
  }

  const role = String(token.role || '')

  if (role !== 'admin' && role !== 'maklare') {
    return null
  }

  if (!token.email || typeof token.email !== 'string') {
    return null
  }

  return {
    role,
    email: token.email.trim().toLowerCase(),
  }
}

// ============================================================
// HELPERS
// ============================================================

function cleanText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const text = String(value).trim()

  return text || null
}

function toNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : null
}

function toInteger(value: unknown): number | null {
  const number = toNumber(value)

  if (number === null) {
    return null
  }

  return Math.trunc(number)
}

function isEmptyValue(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    value === ''
  )
}

function normalizeImages(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === 'string'
    )
    .map((item) => item.trim())
    .filter(Boolean)
}

// Viktigt eftersom .or() använder PostgREST-syntax.
function sanitizeSearch(value: string) {
  return value
    .replace(
      /[^a-zA-Z0-9åäöÅÄÖéÉüÜ\s\-]/g,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function validLatitude(value: number) {
  return (
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  )
}

function validLongitude(value: number) {
  return (
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  )
}

// ============================================================
// GOOGLE GEOCODING
// ============================================================

async function geocodeAddress(
  address: string,
  city: string,
  postalCode?: string | null
): Promise<{
  lat: number
  lon: number
} | null> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.warn(
      'GOOGLE_MAPS_API_KEY saknas. Automatisk geokodning hoppas över.'
    )

    return null
  }

  try {
    const parts = [address]

    if (postalCode) {
      parts.push(postalCode)
    }

    parts.push(city, 'Sweden')

    const params = new URLSearchParams({
      address: parts.join(', '),
      key: apiKey,
    })

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      {
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      console.error(
        'Google Geocoding HTTP-fel:',
        response.status
      )

      return null
    }

    const data = await response.json()

    if (
      data.status !== 'OK' ||
      !data.results?.length
    ) {
      console.warn(
        'Google Geocoding gav ingen träff:',
        data.status
      )

      return null
    }

    const location =
      data.results[0]?.geometry?.location

    if (
      typeof location?.lat !== 'number' ||
      typeof location?.lng !== 'number'
    ) {
      return null
    }

    if (
      !validLatitude(location.lat) ||
      !validLongitude(location.lng)
    ) {
      return null
    }

    return {
      lat: location.lat,
      lon: location.lng,
    }
  } catch (error) {
    console.error(
      'Automatisk geokodning misslyckades:',
      error
    )

    return null
  }
}

// ============================================================
// BEFINTLIG BOSTAD
// ============================================================

async function getExistingProperty(id: number) {
  const { data, error } =
    await supabaseAdmin
      .from('properties')
      .select(
        `
          id,
          created_by,
          address,
          city,
          postal_code,
          latitude,
          longitude,
          is_active
        `
      )
      .eq('id', id)
      .single()

  if (error || !data) {
    return null
  }

  return data
}

// ============================================================
// BEHÖRIGHET
// ============================================================

function canManageProperty(
  property: {
    created_by?: string | null
  },
  token: ManagerToken
) {
  if (token.role === 'admin') {
    return true
  }

  if (!property.created_by) {
    return false
  }

  return (
    property.created_by
      .trim()
      .toLowerCase() === token.email
  )
}

// ============================================================
// GET
//
// PUBLIK:
// /api/properties
//
// ADMIN:
// /api/properties?includeInactive=true
//
// MÄKLARE:
// samma URL men får endast sina egna objekt.
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams =
      request.nextUrl.searchParams

    const search =
      searchParams.get('search')

    const city =
      searchParams.get('city')

    const propertyType =
      searchParams.get('property_type')

    const minPrice =
      searchParams.get('minPrice')

    const maxPrice =
      searchParams.get('maxPrice')

    const minRooms =
      searchParams.get('minRooms')

    const minArea =
      searchParams.get('minArea')

    const maxArea =
      searchParams.get('maxArea')

    const elevator =
      searchParams.get('elevator')

    const balcony =
      searchParams.get('balcony')

    const energyClass =
      searchParams.get('energyClass')

    const sort =
      searchParams.get('sort')

    const includeInactive =
      searchParams.get('includeInactive') ===
      'true'

    // ========================================================
    // ADMIN AUTH
    // ========================================================

    let managerToken:
      | ManagerToken
      | null = null

    if (includeInactive) {
      managerToken =
        await getManagerToken(request)

      if (!managerToken) {
        return json(
          {
            error:
              'Du saknar behörighet att visa inaktiva bostäder.',
          },
          401
        )
      }
    }

    // ========================================================
    // QUERY
    // ========================================================

    let query =
      supabaseAdmin
        .from('properties')
        .select('*')

    // Publik webb får endast aktiva objekt.
    if (!includeInactive) {
      query = query.eq(
        'is_active',
        true
      )
    }

    // Mäklare får endast sina egna objekt.
    if (
      includeInactive &&
      managerToken?.role === 'maklare'
    ) {
      query = query.ilike(
        'created_by',
        managerToken.email
      )
    }

    // ========================================================
    // SEARCH
    // ========================================================

    if (search) {
      const safeSearch =
        sanitizeSearch(search)

      if (safeSearch) {
        query = query.or(
          [
            `title.ilike.%${safeSearch}%`,
            `description.ilike.%${safeSearch}%`,
            `address.ilike.%${safeSearch}%`,
            `city.ilike.%${safeSearch}%`,
            `postal_code.ilike.%${safeSearch}%`,
          ].join(',')
        )
      }
    }

    if (city?.trim()) {
      query = query.ilike(
        'city',
        `%${city.trim()}%`
      )
    }

    if (propertyType) {
      query = query.eq(
        'property_type',
        propertyType
      )
    }

    // ========================================================
    // NUMERISKA FILTER
    // ========================================================

    const parsedMinPrice =
      toInteger(minPrice)

    const parsedMaxPrice =
      toInteger(maxPrice)

    const parsedMinRooms =
      toNumber(minRooms)

    const parsedMinArea =
      toNumber(minArea)

    const parsedMaxArea =
      toNumber(maxArea)

    if (parsedMinPrice !== null) {
      query = query.gte(
        'price',
        parsedMinPrice
      )
    }

    if (parsedMaxPrice !== null) {
      query = query.lte(
        'price',
        parsedMaxPrice
      )
    }

    if (parsedMinRooms !== null) {
      query = query.gte(
        'rooms',
        parsedMinRooms
      )
    }

    if (parsedMinArea !== null) {
      query = query.gte(
        'area',
        parsedMinArea
      )
    }

    if (parsedMaxArea !== null) {
      query = query.lte(
        'area',
        parsedMaxArea
      )
    }

    // ========================================================
    // BOOLEAN FILTER
    // ========================================================

    if (elevator === 'true') {
      query = query.eq(
        'elevator',
        true
      )
    }

    if (balcony === 'true') {
      query = query.eq(
        'balcony',
        true
      )
    }

    // ========================================================
    // ENERGY
    // ========================================================

    if (energyClass) {
      const energy =
        energyClass
          .trim()
          .toUpperCase()

      if (/^[A-G]$/.test(energy)) {
        query = query.eq(
          'energy_class',
          energy
        )
      }
    }

    // ========================================================
    // SORTERING
    // ========================================================

    switch (sort) {
      case 'price-asc':
        query = query.order(
          'price',
          {
            ascending: true,
          }
        )
        break

      case 'price-desc':
        query = query.order(
          'price',
          {
            ascending: false,
          }
        )
        break

      case 'area-desc':
        query = query.order(
          'area',
          {
            ascending: false,
            nullsFirst: false,
          }
        )
        break

      case 'newest':
      default:
        query = query.order(
          'created_at',
          {
            ascending: false,
          }
        )
        break
    }

    const { data, error } =
      await query

    if (error) {
      throw error
    }

    return json({
      properties: data || [],
    })
  } catch (error) {
    console.error(
      'GET properties error:',
      error
    )

    return json(
      {
        error:
          'Kunde inte hämta bostäder.',
      },
      500
    )
  }
}

// ============================================================
// POST – SKAPA BOSTAD
// ============================================================

export async function POST(request: NextRequest) {
  const token =
    await getManagerToken(request)

  if (!token) {
    return json(
      {
        error:
          'Du måste vara inloggad som admin eller mäklare.',
      },
      401
    )
  }

  try {
    const body =
      await request.json()

    const title =
      cleanText(body.title)

    const price =
      toInteger(body.price)

    if (!title) {
      return json(
        {
          error: 'Titel krävs.',
        },
        400
      )
    }

    if (
      price === null ||
      price <= 0
    ) {
      return json(
        {
          error:
            'Ange ett giltigt pris.',
        },
        400
      )
    }

    const description =
      cleanText(body.description)

    const address =
      cleanText(body.address)

    const city =
      cleanText(body.city)

    const postalCode =
      cleanText(body.postal_code)

    const listingUrl =
      cleanText(body.listing_url)

    const propertyType =
      cleanText(body.property_type)

    const floor =
      cleanText(body.floor)

    const association =
      cleanText(body.association)

    // ========================================================
    // ENERGIKLASS
    // ========================================================

    let energyClass =
      cleanText(body.energy_class)

    if (energyClass) {
      energyClass =
        energyClass.toUpperCase()

      if (
        !/^[A-G]$/.test(
          energyClass
        )
      ) {
        return json(
          {
            error:
              'Energiklass måste vara A–G.',
          },
          400
        )
      }
    }

    // ========================================================
    // NUMMER
    // ========================================================

    const area =
      toNumber(body.area)

    const rooms =
      toNumber(body.rooms)

    const monthlyFee =
      toInteger(body.monthly_fee)

    const operatingCost =
      toInteger(
        body.operating_cost
      )

    const constructionYear =
      toInteger(
        body.construction_year
      )

    const plotArea =
      toNumber(body.plot_area)

    const numericFields = [
      {
        label: 'Boarea',
        value: area,
      },
      {
        label: 'Antal rum',
        value: rooms,
      },
      {
        label: 'Månadsavgift',
        value: monthlyFee,
      },
      {
        label: 'Driftkostnad',
        value: operatingCost,
      },
      {
        label: 'Tomtarea',
        value: plotArea,
      },
    ]

    const invalidField =
      numericFields.find(
        (field) =>
          field.value !== null &&
          field.value < 0
      )

    if (invalidField) {
      return json(
        {
          error: `${invalidField.label} kan inte vara negativ.`,
        },
        400
      )
    }

    if (
      constructionYear !== null &&
      (
        constructionYear < 1000 ||
        constructionYear > 2200
      )
    ) {
      return json(
        {
          error:
            'Byggår verkar inte vara giltigt.',
        },
        400
      )
    }

    // ========================================================
    // IMAGES
    // ========================================================

    let images =
      normalizeImages(
        body.images
      )

    let imageUrl =
      cleanText(body.image_url)

    if (
      imageUrl &&
      !images.includes(imageUrl)
    ) {
      images = [
        imageUrl,
        ...images,
      ]
    }

    if (
      !imageUrl &&
      images.length > 0
    ) {
      imageUrl = images[0]
    }

    // ========================================================
    // COORDINATES
    // ========================================================

    let latitude =
      toNumber(body.latitude)

    let longitude =
      toNumber(body.longitude)

    if (
      latitude !== null &&
      !validLatitude(latitude)
    ) {
      return json(
        {
          error:
            'Latitude är ogiltig.',
        },
        400
      )
    }

    if (
      longitude !== null &&
      !validLongitude(longitude)
    ) {
      return json(
        {
          error:
            'Longitude är ogiltig.',
        },
        400
      )
    }

    if (
      latitude === null ||
      longitude === null
    ) {
      latitude = null
      longitude = null

      if (address && city) {
        const coords =
          await geocodeAddress(
            address,
            city,
            postalCode
          )

        if (coords) {
          latitude =
            coords.lat

          longitude =
            coords.lon
        }
      }
    }

    // ========================================================
    // INSERT
    // ========================================================

    const insertData = {
      title,
      description,

      price,
      area,
      rooms,

      address,
      city,
      postal_code:
        postalCode,

      image_url:
        imageUrl,

      images,

      listing_url:
        listingUrl,

      latitude,
      longitude,

      // Klienten får aldrig välja ägare själv.
      created_by:
        token.email,

      monthly_fee:
        monthlyFee,

      operating_cost:
        operatingCost,

      floor,

      elevator:
        body.elevator === true ||
        body.elevator === 'true',

      balcony:
        body.balcony === true ||
        body.balcony === 'true',

      property_type:
        propertyType,

      construction_year:
        constructionYear,

      plot_area:
        plotArea,

      energy_class:
        energyClass,

      association,

      is_active: true,
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from('properties')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error(
        'Supabase insert error:',
        error
      )

      return json(
        {
          error:
            error.message,
          code:
            error.code,
          details:
            error.details,
          hint:
            error.hint,
        },
        500
      )
    }

    return json(
      {
        success: true,
        property: data,
      },
      201
    )
  } catch (error: any) {
    console.error(
      'POST property error:',
      error
    )

    return json(
      {
        error:
          error?.message ||
          'Kunde inte skapa bostaden.',
      },
      500
    )
  }
}

// ============================================================
// PUT – REDIGERA BOSTAD
// ============================================================

export async function PUT(request: NextRequest) {
  const token =
    await getManagerToken(request)

  if (!token) {
    return json(
      {
        error:
          'Du saknar behörighet.',
      },
      401
    )
  }

  try {
    const body =
      await request.json()

    const id =
      toInteger(body.id)

    if (
      id === null ||
      id <= 0
    ) {
      return json(
        {
          error:
            'Ett giltigt ID krävs.',
        },
        400
      )
    }

    const existing =
      await getExistingProperty(id)

    if (!existing) {
      return json(
        {
          error:
            'Bostaden hittades inte.',
        },
        404
      )
    }

    if (
      !canManageProperty(
        existing,
        token
      )
    ) {
      return json(
        {
          error:
            'Du får inte redigera den här bostaden.',
        },
        403
      )
    }

    const updates:
      Record<string, unknown> = {}

    // ========================================================
    // TITLE
    // ========================================================

    if (body.title !== undefined) {
      const title =
        cleanText(body.title)

      if (!title) {
        return json(
          {
            error:
              'Titel kan inte vara tom.',
          },
          400
        )
      }

      updates.title = title
    }

    // ========================================================
    // PRICE
    // ========================================================

    if (body.price !== undefined) {
      const price =
        toInteger(body.price)

      if (
        price === null ||
        price <= 0
      ) {
        return json(
          {
            error:
              'Ange ett giltigt pris.',
          },
          400
        )
      }

      updates.price = price
    }

    // ========================================================
    // INTEGER
    // ========================================================

    const integerFields = [
      'monthly_fee',
      'operating_cost',
      'construction_year',
    ]

    for (const field of integerFields) {
      if (
        body[field] === undefined
      ) {
        continue
      }

      if (
        isEmptyValue(body[field])
      ) {
        updates[field] = null
        continue
      }

      const value =
        toInteger(body[field])

      if (value === null) {
        return json(
          {
            error:
              `${field} innehåller ett ogiltigt värde.`,
          },
          400
        )
      }

      if (value < 0) {
        return json(
          {
            error:
              `${field} kan inte vara negativt.`,
          },
          400
        )
      }

      updates[field] = value
    }

    // ========================================================
    // DECIMAL/NUMBER
    // ========================================================

    const numberFields = [
      'area',
      'rooms',
      'plot_area',
    ]

    for (const field of numberFields) {
      if (
        body[field] === undefined
      ) {
        continue
      }

      if (
        isEmptyValue(body[field])
      ) {
        updates[field] = null
        continue
      }

      const value =
        toNumber(body[field])

      if (value === null) {
        return json(
          {
            error:
              `${field} innehåller ett ogiltigt värde.`,
          },
          400
        )
      }

      if (value < 0) {
        return json(
          {
            error:
              `${field} kan inte vara negativt.`,
          },
          400
        )
      }

      updates[field] = value
    }

    // ========================================================
    // TEXT
    // ========================================================

    const textFields = [
      'description',
      'address',
      'city',
      'postal_code',
      'image_url',
      'listing_url',
      'floor',
      'property_type',
      'association',
    ]

    for (const field of textFields) {
      if (
        body[field] !== undefined
      ) {
        updates[field] =
          cleanText(body[field])
      }
    }

    // ========================================================
    // ENERGY
    // ========================================================

    if (
      body.energy_class !==
      undefined
    ) {
      const energy =
        cleanText(
          body.energy_class
        )

      if (!energy) {
        updates.energy_class =
          null
      } else {
        const normalized =
          energy.toUpperCase()

        if (
          !/^[A-G]$/.test(
            normalized
          )
        ) {
          return json(
            {
              error:
                'Energiklass måste vara A–G.',
            },
            400
          )
        }

        updates.energy_class =
          normalized
      }
    }

    // ========================================================
    // BOOLEAN
    // ========================================================

    for (const field of [
      'elevator',
      'balcony',
    ]) {
      if (
        body[field] !== undefined
      ) {
        updates[field] =
          body[field] === true ||
          body[field] === 'true'
      }
    }

    // ========================================================
    // IMAGES
    // ========================================================

    if (body.images !== undefined) {
      const images =
        normalizeImages(
          body.images
        )

      updates.images = images

      if (
        body.image_url === undefined
      ) {
        updates.image_url =
          images[0] || null
      }
    }

    // ========================================================
    // COORDINATES
    // ========================================================

    const latitudeSent =
      body.latitude !== undefined

    const longitudeSent =
      body.longitude !== undefined

    if (latitudeSent) {
      if (
        isEmptyValue(
          body.latitude
        )
      ) {
        updates.latitude =
          null
      } else {
        const latitude =
          toNumber(
            body.latitude
          )

        if (
          latitude === null ||
          !validLatitude(latitude)
        ) {
          return json(
            {
              error:
                'Latitude är ogiltig.',
            },
            400
          )
        }

        updates.latitude =
          latitude
      }
    }

    if (longitudeSent) {
      if (
        isEmptyValue(
          body.longitude
        )
      ) {
        updates.longitude =
          null
      } else {
        const longitude =
          toNumber(
            body.longitude
          )

        if (
          longitude === null ||
          !validLongitude(
            longitude
          )
        ) {
          return json(
            {
              error:
                'Longitude är ogiltig.',
            },
            400
          )
        }

        updates.longitude =
          longitude
      }
    }

    // ========================================================
    // BUILD YEAR
    // ========================================================

    if (
      updates.construction_year !==
        null &&
      updates.construction_year !==
        undefined
    ) {
      const year =
        Number(
          updates.construction_year
        )

      if (
        year < 1000 ||
        year > 2200
      ) {
        return json(
          {
            error:
              'Byggår verkar inte vara giltigt.',
          },
          400
        )
      }
    }

    // ========================================================
    // GEOCODE VID ADRESSÄNDRING
    // ========================================================

    const addressWasChanged =
      body.address !== undefined ||
      body.city !== undefined ||
      body.postal_code !== undefined

    const finalAddress =
      updates.address !== undefined
        ? cleanText(
            updates.address
          )
        : cleanText(
            existing.address
          )

    const finalCity =
      updates.city !== undefined
        ? cleanText(
            updates.city
          )
        : cleanText(
            existing.city
          )

    const finalPostalCode =
      updates.postal_code !== undefined
        ? cleanText(
            updates.postal_code
          )
        : cleanText(
            existing.postal_code
          )

    // Om användaren ändrar adress men inte manuellt
    // skickar koordinater -> hämta nya koordinater.
    if (
      addressWasChanged &&
      !latitudeSent &&
      !longitudeSent &&
      finalAddress &&
      finalCity
    ) {
      const coordinates =
        await geocodeAddress(
          finalAddress,
          finalCity,
          finalPostalCode
        )

      if (coordinates) {
        updates.latitude =
          coordinates.lat

        updates.longitude =
          coordinates.lon
      }
    }

    // Om koordinater uttryckligen rensats
    // försöker vi också geokoda.
    const finalLatitude =
      updates.latitude !== undefined
        ? updates.latitude
        : existing.latitude

    const finalLongitude =
      updates.longitude !== undefined
        ? updates.longitude
        : existing.longitude

    if (
      (
        finalLatitude === null ||
        finalLongitude === null
      ) &&
      finalAddress &&
      finalCity
    ) {
      const coordinates =
        await geocodeAddress(
          finalAddress,
          finalCity,
          finalPostalCode
        )

      if (coordinates) {
        updates.latitude =
          coordinates.lat

        updates.longitude =
          coordinates.lon
      }
    }

    updates.updated_at =
      new Date().toISOString()

    // ========================================================
    // UPDATE
    // ========================================================

    const {
      data,
      error,
    } = await supabaseAdmin
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return json({
      success: true,
      property: data,
    })
  } catch (error: any) {
    console.error(
      'PUT property error:',
      error
    )

    return json(
      {
        error:
          error?.message ||
          'Kunde inte uppdatera bostaden.',
      },
      500
    )
  }
}

// ============================================================
// PATCH
//
// ÅTERAKTIVERA / INAKTIVERA
//
// {
//   id: 123,
//   is_active: true
// }
// ============================================================

export async function PATCH(
  request: NextRequest
) {
  const token =
    await getManagerToken(request)

  if (!token) {
    return json(
      {
        error:
          'Du saknar behörighet.',
      },
      401
    )
  }

  try {
    const body =
      await request.json()

    const id =
      toInteger(body.id)

    if (
      id === null ||
      id <= 0
    ) {
      return json(
        {
          error:
            'Ett giltigt ID krävs.',
        },
        400
      )
    }

    if (
      typeof body.is_active !==
      'boolean'
    ) {
      return json(
        {
          error:
            'is_active måste vara true eller false.',
        },
        400
      )
    }

    const existing =
      await getExistingProperty(id)

    if (!existing) {
      return json(
        {
          error:
            'Bostaden hittades inte.',
        },
        404
      )
    }

    if (
      !canManageProperty(
        existing,
        token
      )
    ) {
      return json(
        {
          error:
            'Du får inte ändra status på den här bostaden.',
        },
        403
      )
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from('properties')
      .update({
        is_active:
          body.is_active,

        updated_at:
          new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return json({
      success: true,
      property: data,
    })
  } catch (error: any) {
    console.error(
      'PATCH property error:',
      error
    )

    return json(
      {
        error:
          error?.message ||
          'Kunde inte ändra bostadens status.',
      },
      500
    )
  }
}

// ============================================================
// DELETE
//
// Standard:
// DELETE /api/properties?id=123
// -> inaktiverar
//
// Permanent:
// DELETE /api/properties?id=123&permanent=true
// -> tar bort ur databasen
// -> ENDAST ADMIN
// ============================================================

export async function DELETE(
  request: NextRequest
) {
  const token =
    await getManagerToken(request)

  if (!token) {
    return json(
      {
        error:
          'Du saknar behörighet.',
      },
      401
    )
  }

  try {
    const id =
      toInteger(
        request.nextUrl.searchParams.get(
          'id'
        )
      )

    const permanent =
      request.nextUrl.searchParams.get(
        'permanent'
      ) === 'true'

    if (
      id === null ||
      id <= 0
    ) {
      return json(
        {
          error:
            'Ett giltigt ID krävs.',
        },
        400
      )
    }

    const existing =
      await getExistingProperty(id)

    if (!existing) {
      return json(
        {
          error:
            'Bostaden hittades inte.',
        },
        404
      )
    }

    // ========================================================
    // PERMANENT RADERING
    // ========================================================

    if (permanent) {
      if (
        token.role !== 'admin'
      ) {
        return json(
          {
            error:
              'Endast administratörer får radera bostäder permanent.',
          },
          403
        )
      }

      const { error } =
        await supabaseAdmin
          .from('properties')
          .delete()
          .eq('id', id)

      if (error) {
        throw error
      }

      return json({
        success: true,
        permanent: true,
      })
    }

    // ========================================================
    // SOFT DELETE
    // ========================================================

    if (
      !canManageProperty(
        existing,
        token
      )
    ) {
      return json(
        {
          error:
            'Du får inte inaktivera den här bostaden.',
        },
        403
      )
    }

    if (
      existing.is_active === false
    ) {
      return json({
        success: true,
        alreadyInactive: true,
      })
    }

    const { error } =
      await supabaseAdmin
        .from('properties')
        .update({
          is_active: false,

          updated_at:
            new Date().toISOString(),
        })
        .eq('id', id)

    if (error) {
      throw error
    }

    return json({
      success: true,
      permanent: false,
    })
  } catch (error: any) {
    console.error(
      'DELETE property error:',
      error
    )

    return json(
      {
        error:
          error?.message ||
          'Kunde inte ta bort bostaden.',
      },
      500
    )
  }
}