import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Ogiltigt ID' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Bostaden hittades inte' }, { status: 404 })
    }

    return NextResponse.json({ property: data })
  } catch (error) {
    console.error('GET property error:', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}