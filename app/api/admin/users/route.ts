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
    console.error(error)
    return NextResponse.json({ error: 'Kunde inte hämta admin-användare' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, password, role } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ogiltig e-postadress' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const insertData: Record<string, any> = {
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

    return NextResponse.json({
      success: true,
      admin: {
        id: data.id,
        email: data.email,
        created_at: data.created_at,
        added_by: data.added_by,
        has_password: !!data.password_hash,
        role: data.role || 'admin',
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Kunde inte lägga till admin' }, { status: 500 })
  }
}

// DELETE och PUT är oförändrade, men du kan kopiera från din befintliga route.ts