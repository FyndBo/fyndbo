import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Ingen fil bifogad' }, { status: 400 })
    }

    // Generera ett unikt filnamn (tidsstämpel + originalnamn)
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`

    const { data, error } = await supabaseAdmin.storage
      .from('property-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Uppladdningsfel:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Hämta publika URL:en för den uppladdade bilden
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('property-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (error: any) {
    console.error('Serverfel:', error)
    return NextResponse.json({ error: error.message || 'Serverfel' }, { status: 500 })
  }
}