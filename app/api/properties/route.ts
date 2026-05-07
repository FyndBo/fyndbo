import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin.from('properties').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ properties: data })
  } catch (error) {
    return NextResponse.json({ error: 'Kunde inte hämta bostäder' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { title, description, price, area, rooms, address, city, image_url } = await request.json()
    if (!title || !price) return NextResponse.json({ error: 'Titel och pris krävs' }, { status: 400 })
    const { data, error } = await supabaseAdmin.from('properties').insert({ title, description, price, area, rooms, address, city, image_url }).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, property: data })
  } catch (error) {
    return NextResponse.json({ error: 'Kunde inte lägga till bostad' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID krävs' }, { status: 400 })
    const { error } = await supabaseAdmin.from('properties').delete().eq('id', parseInt(id))
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Kunde inte ta bort bostad' }, { status: 500 })
  }
}