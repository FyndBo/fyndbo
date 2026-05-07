import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validera e-post
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Spara i Supabase-tabellen "waitlist"
    const { error } = await supabaseAdmin
      .from('waitlist')
      .insert({ email, created_at: new Date().toISOString() })

    if (error) {
      // Om e-post redan finns (unique constraint)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Email saved!' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}