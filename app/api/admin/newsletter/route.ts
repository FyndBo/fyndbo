import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'admin') {
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
    const recipients = testEmail ? [{ email: testEmail }] : emails.map(email => ({ email }))

    // ─────────── PREMIUM E-POSTMALL ───────────
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                
                <!-- HEADER med logga -->
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 20px;">
                    <img src="https://fyndbo.se/Fyndbo-blue-bkg.png" 
                         alt="FyndBo" 
                         style="height: 50px; width: auto; display: block; margin: 0 auto;" />
                  </td>
                </tr>

                <!-- Rubrik -->
                <tr>
                  <td style="padding: 30px 40px 10px 40px; text-align: center;">
                    <h1 style="color: #1e293b; font-size: 24px; margin: 0;">${subject}</h1>
                  </td>
                </tr>

                <!-- Innehåll (från adminpanelen) -->
                <tr>
                  <td style="padding: 10px 40px 30px 40px; font-size: 16px; line-height: 1.6; color: #333333;">
                    ${content}
                  </td>
                </tr>

                <!-- CTA-knapp -->
                <tr>
                  <td align="center" style="padding: 0 40px 30px 40px;">
                    <a href="https://fyndbo.se" 
                       style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(37,99,235,0.4);">
                      Besök FyndBo.se
                    </a>
                  </td>
                </tr>

                <!-- Footer med avregistrering -->
                <tr>
                  <td style="background: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">
                      FyndBo.se – Hitta ditt nästa hem
                    </p>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                      <a href="https://fyndbo.se" style="color: #2563eb; text-decoration: none;">fyndbo.se</a> | 
                      <a href="https://fyndbo.se/avregistrera" style="color: #94a3b8; text-decoration: none;">Avregistrera</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // Skicka via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          name: 'FyndBo.se',
          email: 'nyhetsbrev@fyndbo.se',
        },
        to: recipients,
        subject: subject,
        htmlContent: htmlContent,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Brevo API error:', result)
      return NextResponse.json({ 
        error: result.message || 'Kunde inte skicka nyhetsbrev' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      sent: recipients.length,
      messageId: result.messageId 
    })
  } catch (error) {
    console.error('Newsletter error:', error)
    return NextResponse.json({ error: 'Kunde inte skicka nyhetsbrev' }, { status: 500 })
  }
}