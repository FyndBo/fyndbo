import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

// Hämta alla admin-användare
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, created_at, added_by, password_hash')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Kunde inte hämta admin-användare',
        details: error.message 
      }, { status: 500 })
    }

    const admins = (data || []).map((admin: any) => ({
      id: admin.id,
      email: admin.email,
      created_at: admin.created_at,
      added_by: admin.added_by,
      has_password: !!admin.password_hash
    }))

    return NextResponse.json({ admins })
  } catch (error: any) {
    console.error('GET error:', error)
    return NextResponse.json({ 
      error: 'Kunde inte hämta admin-användare',
      details: error.message 
    }, { status: 500 })
  }
}

// Lägg till ny admin-användare
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Ogiltig e-postadress' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    const insertData: any = {
      email: cleanEmail,
      added_by: token.email || 'unknown',
    }

    // Hasha lösenord om det finns
    if (password && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Lösenordet måste vara minst 6 tecken' }, { status: 400 })
      }
      const salt = await bcrypt.genSalt(10)
      insertData.password_hash = await bcrypt.hash(password, salt)
    }

    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert(insertData)
      .select('id, email, created_at, added_by, password_hash')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      
      if (error.code === '23505') {
        return NextResponse.json({ error: 'E-postadressen finns redan' }, { status: 409 })
      }
      
      return NextResponse.json({ 
        error: 'Kunde inte lägga till admin',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    const admin = data as any
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        created_at: admin.created_at,
        added_by: admin.added_by,
        has_password: !!admin.password_hash
      }
    })
  } catch (error: any) {
    console.error('POST error:', error)
    return NextResponse.json({ 
      error: 'Kunde inte lägga till admin',
      details: error.message 
    }, { status: 500 })
  }
}

// Ta bort admin-användare
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

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ 
        error: 'Kunde inte ta bort admin',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE error:', error)
    return NextResponse.json({ 
      error: 'Kunde inte ta bort admin',
      details: error.message 
    }, { status: 500 })
  }
}

// Uppdatera lösenord för admin
export async function PUT(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, password } = await request.json()

    if (!id || !password) {
      return NextResponse.json({ error: 'ID och lösenord krävs' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Lösenordet måste vara minst 6 tecken' }, { status: 400 })
    }

    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const { error } = await supabaseAdmin
      .from('admin_users')
      .update({ password_hash })
      .eq('id', id)

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ 
        error: 'Kunde inte uppdatera lösenord',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Lösenord uppdaterat' })
  } catch (error: any) {
    console.error('PUT error:', error)
    return NextResponse.json({ 
      error: 'Kunde inte uppdatera lösenord',
      details: error.message 
    }, { status: 500 })
  }
}