import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ogiltig e-postadress' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('waitlist')
      .delete()
      .eq('email', email.toLowerCase().trim())

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Kunde inte avregistrera' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}