import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts/lists', {
      headers: { 'api-key': process.env.BREVO_API_KEY || '' }
    })
    const data = await response.json()
    return NextResponse.json({ lists: data.lists || [] })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 })
  }
}