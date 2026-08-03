import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// ============================================================
// Hjälpfunktion – servergeokodning med Nominatim
// ============================================================
async function geocodeAddress(
  address: string,
  city: string,
  postalCode?: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const parts = [address]
    if (postalCode) parts.push(postalCode)
    parts.push(city, 'Sweden')
    const query = encodeURIComponent(parts.join(', '))
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'FyndBo/1.0 (nyhetsbrev@fyndbo.se)' },
    })
    const data = await res.json()

    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
    }
  } catch (error) {
    console.error('Server‑geokodning misslyckades:', error)
  }
  return null
}

// ============================================================
// GET – hämta alla aktiva bostäder med utökade filter
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const propertyType = searchParams.get('property_type')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minRooms = searchParams.get('minRooms')
    const minArea = searchParams.get('minArea')
    const maxArea = searchParams.get('maxArea')
    const elevator = searchParams.get('elevator')
    const balcony = searchParams.get('balcony')
    const energyClass = searchParams.get('energyClass')

    let query = supabaseAdmin
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%,postal_code.ilike.%${search}%`
      )
    }
    if (city) query = query.ilike('city', `%${city}%`)
    if (propertyType) query = query.eq('property_type', propertyType)
    if (minPrice) query = query.gte('price', parseInt(minPrice))
    if (maxPrice) query = query.lte('price', parseInt(maxPrice))
    if (minRooms) query = query.gte('rooms', parseFloat(minRooms))
    if (minArea) query = query.gte('area', parseInt(minArea))
    if (maxArea) query = query.lte('area', parseInt(maxArea))
    if (elevator === 'true') query = query.eq('elevator', true)
    if (balcony === 'true') query = query.eq('balcony', true)
    if (energyClass) query = query.eq('energy_class', energyClass.toUpperCase())

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ properties: data })
  } catch (error) {
    console.error('GET properties error:', error)
    return NextResponse.json({ error: 'Kunde inte hämta bostäder' }, { status: 500 })
  }
}

// ============================================================
// POST – skapa bostad (admin/mäklare)
// ============================================================
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || !token.role) {
    return NextResponse.json({ error: 'Unauthorized – du måste vara inloggad' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      title, description, price, area, rooms, address, city, postal_code,
      image_url, listing_url, latitude, longitude, created_by,
      monthly_fee, operating_cost, floor, elevator, balcony, images,
      property_type, construction_year, plot_area, energy_class, association
    } = body

    if (!title || !price) {
      return NextResponse.json({ error: 'Titel och pris krävs' }, { status: 400 })
    }

    let lat = latitude ? parseFloat(latitude) : null
    let lng = longitude ? parseFloat(longitude) : null

    if ((!lat || !lng) && address && city) {
      const coords = await geocodeAddress(address, city, postal_code)
      if (coords) { lat = coords.lat; lng = coords.lon }
    }

    const insertData: any = {
      title,
      description: description || null,
      price: parseInt(price),
      area: area ? parseInt(area) : null,
      rooms: rooms ? parseFloat(rooms) : null,
      address: address || null,
      city: city || null,
      postal_code: postal_code || null,
      image_url: image_url || null,
      listing_url: listing_url || null,
      latitude: lat,
      longitude: lng,
      created_by: created_by || token.email,
      monthly_fee: monthly_fee ? parseInt(monthly_fee) : null,
      operating_cost: operating_cost ? parseInt(operating_cost) : null,
      floor: floor || null,
      elevator: elevator === true || elevator === 'true',
      balcony: balcony === true || balcony === 'true',
      images: Array.isArray(images) ? images : image_url ? [image_url] : [],
      property_type: property_type || null,
      construction_year: construction_year ? parseInt(construction_year) : null,
      plot_area: plot_area ? parseInt(plot_area) : null,
      energy_class: energy_class || null,
      association: association || null,
    }

    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({
        error: error.message, code: error.code, details: error.details, hint: error.hint,
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, property: data })
  } catch (error: any) {
    console.error('POST property error:', error)
    return NextResponse.json({ error: error.message || 'Okänt serverfel' }, { status: 500 })
  }
}

// ============================================================
// PUT – uppdatera bostad (admin/mäklare)
// ============================================================
export async function PUT(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || !token.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'ID krävs' }, { status: 400 })

    const updates: Record<string, any> = {}
    const fields = [
      'title', 'description', 'price', 'area', 'rooms', 'address', 'city',
      'postal_code', 'image_url', 'listing_url', 'latitude', 'longitude',
      'monthly_fee', 'operating_cost', 'floor', 'elevator', 'balcony',
      'images', 'property_type', 'construction_year', 'plot_area',
      'energy_class', 'association',
    ]

    for (const field of fields) {
      if (body[field] !== undefined) {
        if (['price', 'area', 'monthly_fee', 'operating_cost', 'construction_year', 'plot_area'].includes(field)) {
          updates[field] = parseInt(body[field])
        } else if (['rooms', 'latitude', 'longitude'].includes(field)) {
          updates[field] = parseFloat(body[field])
        } else if (['elevator', 'balcony'].includes(field)) {
          updates[field] = body[field] === true || body[field] === 'true'
        } else if (field === 'images') {
          updates[field] = Array.isArray(body[field]) ? body[field] : []
        } else {
          updates[field] = body[field]
        }
      }
    }

    if ((!updates.latitude || !updates.longitude) && updates.address && updates.city) {
      const coords = await geocodeAddress(updates.address, updates.city, updates.postal_code || body.postal_code)
      if (coords) {
        updates.latitude = coords.lat
        updates.longitude = coords.lon
      }
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, property: data })
  } catch (error) {
    console.error('PUT property error:', error)
    return NextResponse.json({ error: 'Kunde inte uppdatera bostad' }, { status: 500 })
  }
}

// ============================================================
// DELETE – inaktivera bostad (admin/mäklare)
// ============================================================
export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || !token.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID krävs' }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('properties')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE property error:', error)
    return NextResponse.json({ error: 'Kunde inte ta bort bostad' }, { status: 500 })
  }
}