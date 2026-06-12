import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// Hjälpfunktion för server‑side geokodning
async function geocodeAddress(address: string, city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${city}, Sweden`)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const city = searchParams.get('city')

    let query = supabaseAdmin
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`)
    }
    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ properties: data })
  } catch (error) {
    console.error('GET properties error:', error)
    return NextResponse.json({ error: 'Kunde inte hämta bostäder' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || !token.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    let {
      title, description, price, area, rooms, address, city,
      image_url, listing_url, latitude, longitude, created_by,
      monthly_fee, operating_cost, floor, elevator, balcony, images
    } = body

    if (!title || !price) {
      return NextResponse.json({ error: 'Titel och pris krävs' }, { status: 400 })
    }

    let lat = latitude ? parseFloat(latitude) : null
    let lng = longitude ? parseFloat(longitude) : null
    if ((!lat || !lng) && address && city) {
      const coords = await geocodeAddress(address, city)
      if (coords) {
        lat = coords.lat
        lng = coords.lon
      }
    }

    const insertData: any = {
      title,
      description: description || null,
      price: parseInt(price),
      area: area ? parseInt(area) : null,
      rooms: rooms ? parseFloat(rooms) : null,
      address: address || null,
      city: city || null,
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
      images: images && Array.isArray(images) ? images : (image_url ? [image_url] : [])
    }

    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, property: data })
  } catch (error) {
    console.error('POST property error:', error)
    return NextResponse.json({ error: 'Kunde inte lägga till bostad' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || !token.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'ID krävs' }, { status: 400 })

    // Bygg uppdateringsobjekt dynamiskt
    const updates: Record<string, any> = {}
    const fields = ['title','description','price','area','rooms','address','city','image_url','listing_url','latitude','longitude','monthly_fee','operating_cost','floor','elevator','balcony','images']
    for (const field of fields) {
      if (body[field] !== undefined) {
        if (field === 'price' || field === 'area' || field === 'monthly_fee' || field === 'operating_cost') {
          updates[field] = parseInt(body[field])
        } else if (field === 'rooms' || field === 'latitude' || field === 'longitude') {
          updates[field] = parseFloat(body[field])
        } else if (field === 'elevator' || field === 'balcony') {
          updates[field] = body[field] === true || body[field] === 'true'
        } else if (field === 'images') {
          updates[field] = Array.isArray(body[field]) ? body[field] : []
        } else {
          updates[field] = body[field]
        }
      }
    }

    // Geokodning om koordinater saknas
    if ((!updates.latitude || !updates.longitude) && (updates.address && updates.city)) {
      const coords = await geocodeAddress(updates.address, updates.city)
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