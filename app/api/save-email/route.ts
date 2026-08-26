import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('waitlist')
      .insert({ email, created_at: new Date().toISOString() })

    if (error) {
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