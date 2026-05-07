import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { subject, content, testEmail } = await request.json()

    if (!subject || !content) {
      return NextResponse.json({ error: 'Ämne och innehåll krävs' }, { status: 400 })
    }

    // Hämta alla e-post från waitlist
    const { data: subscribers, error } = await supabaseAdmin
      .from('waitlist')
      .select('email')

    if (error) throw error

    const emails = subscribers.map(s => s.email)
    
    // Om test-e-post anges, skicka bara till den
    const recipients = testEmail ? [testEmail] : emails

    // Skicka e-post via Resend
    const result = await resend.emails.send({
      from: 'FyndBo.se <nyhetsbrev@fyndbo.se>',
      to: recipients,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center;">
            <img src="https://fyndbo.vercel.app/Fyndbo-blue-bkg.png" alt="FyndBo.se" style="height: 60px;">
          </div>
          <div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 40px; border-radius: 12px; margin-top: 20px;">
            ${content}
          </div>
          <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
            <p>FyndBo.se – Hitta ditt nästa hem</p>
            <p><a href="https://fyndbo.se" style="color: #3b82f6;">fyndbo.se</a></p>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ 
      success: true, 
      sent: recipients.length,
      result 
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Kunde inte skicka nyhetsbrev' }, { status: 500 })
  }
}