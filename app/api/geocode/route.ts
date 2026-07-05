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

  // Bygg söksträng med postnummer om det finns
  const parts = [address]
  if (postal_code) parts.push(postal_code)
  parts.push(city, 'Sweden')
  const query = encodeURIComponent(parts.join(', '))

  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'FyndBo/1.0 (nyhetsbrev@fyndbo.se)',
      },
    })
    const data = await res.json()
    if (data && data.length > 0) {
      return NextResponse.json({
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      })
    }
    return NextResponse.json({ error: 'Ingen träff för adressen' }, { status: 404 })
  } catch (error) {
    console.error('Geokodningsfel:', error)
    return NextResponse.json({ error: 'Kunde inte hämta koordinater' }, { status: 500 })
  }
}