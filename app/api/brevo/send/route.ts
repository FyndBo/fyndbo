import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { listId, subject, content, testEmail } = await request.json()
    if (!listId || !subject || !content) {
      return NextResponse.json({ error: 'ListId, subject and content required' }, { status: 400 })
    }

    // Bygg recipients
    let to: any[] = []
    if (testEmail) {
      to = [{ email: testEmail }]
    }

    const payload: any = {
      sender: { 
        email: process.env.BREVO_SENDER_EMAIL || 'info@fyndbo.se', 
        name: 'FyndBo.se' 
      },
      subject,
      htmlContent: content,
    }

    if (testEmail) {
      payload.to = to
    } else {
      payload.listIds = [listId]
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Brevo API error:', data)
      throw new Error(data.message || 'Brevo API error')
    }

    return NextResponse.json({ 
      success: true, 
      sent: testEmail ? 1 : undefined,
      messageId: data.messageId 
    })
  } catch (error: any) {
    console.error('Send error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to send' 
    }, { status: 500 })
  }
}