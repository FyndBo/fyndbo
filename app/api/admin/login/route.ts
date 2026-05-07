import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Lösenord krävs' }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 timmar
        path: '/',
      })
      return response
    }

    return NextResponse.json({ error: 'Fel lösenord' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}