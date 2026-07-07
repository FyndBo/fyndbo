import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const city = searchParams.get('city')
  const postal_code = searchParams.get('postal_code')

  if (!address || !city) {
    return NextResponse.json({ error: 'Adress och stad krävs' }, { status: 400 })
  }

  // Bygg adress med postnummer om det finns
  const parts = [address]
  if (postal_code) parts.push(postal_code)
  parts.push(city, 'Sweden')
  const query = encodeURIComponent(parts.join(', '))

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${API_KEY}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location
      return NextResponse.json({ lat, lon: lng })
    }

    return NextResponse.json({ error: 'Ingen träff för adressen' }, { status: 404 })
  } catch (error) {
    console.error('Geokodningsfel:', error)
    return NextResponse.json({ error: 'Kunde inte hämta koordinater' }, { status: 500 })
  }
}