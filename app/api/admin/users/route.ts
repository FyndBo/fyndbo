import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

interface AdminUser {
  id: number
  email: string
  created_at: string
  added_by: string | null
  password_hash: string | null
  role: string
}

// GET – hämta alla användare (endast admin)
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, created_at, added_by, password_hash, role')
      .order('created_at', { ascending: false })

    if (error) throw error

    const admins = (data as AdminUser[]).map(admin => ({
      id: admin.id,
      email: admin.email,
      created_at: admin.created_at,
      added_by: admin.added_by,
      has_password: !!admin.password_hash,
      role: admin.role || 'admin',
    }))

    return NextResponse.json({ admins })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Kunde inte hämta admin-användare' }, { status: 500 })
  }
}

// POST – skapa ny användare
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email, password, role } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ogiltig e-postadress' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const insertData: any = {
      email: cleanEmail,
      added_by: token.email as string,
      role: role || 'admin',
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Lösenordet måste vara minst 6 tecken' }, { status: 400 })
      }
      const salt = await bcrypt.genSalt(10)
      insertData.password_hash = await bcrypt.hash(password, salt)
    }

    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert(insertData)
      .select('id, email, created_at, added_by, password_hash, role')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'E-postadressen finns redan' }, { status: 409 })
      }
      throw error
    }

    const admin = data as AdminUser
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        created_at: admin.created_at,
        added_by: admin.added_by,
        has_password: !!admin.password_hash,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Kunde inte lägga till admin' }, { status: 500 })
  }
}

// DELETE – ta bort användare
export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID saknas' }, { status: 400 })
    }

    // Förhindra att man tar bort sig själv
    const { data: userToDelete } = await supabaseAdmin
      .from('admin_users')
      .select('email')
      .eq('id', id)
      .single()

    if (userToDelete && (userToDelete as any).email === token.email) {
      return NextResponse.json({ error: 'Du kan inte ta bort dig själv' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Kunde inte ta bort admin' }, { status: 500 })
  }
}

// PUT – ändra lösenord
export async function PUT(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, password } = await request.json()
    if (!id || !password || password.length < 6) {
      return NextResponse.json({ error: 'ID och lösenord (minst 6 tecken) krävs' }, { status: 400 })
    }

    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const { error } = await supabaseAdmin
      .from('admin_users')
      .update({ password_hash })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true, message: 'Lösenord uppdaterat' })
  } catch (error) {
    console.error('PUT error:', error)
    return NextResponse.json({ error: 'Kunde inte uppdatera lösenord' }, { status: 500 })
  }
}

// PATCH – ändra roll (ny!)
export async function PATCH(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, role } = await request.json()
    if (!id || !role) {
      return NextResponse.json({ error: 'ID och roll krävs' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('admin_users')
      .update({ role })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true, message: 'Roll uppdaterad' })
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ error: 'Kunde inte uppdatera roll' }, { status: 500 })
  }
}