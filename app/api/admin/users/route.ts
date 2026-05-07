import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// Hämta alla admin-användare
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, created_at, added_by')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ admins: data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Kunde inte hämta admin-användare' }, { status: 500 })
  }
}

// Lägg till ny admin-användare
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ogiltig e-postadress' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert({ email, added_by: token.email })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'E-postadressen finns redan' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true, admin: data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Kunde inte lägga till admin' }, { status: 500 })
  }
}

// Ta bort admin-användare
export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID saknas' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Kunde inte ta bort admin' }, { status: 500 })
  }
}