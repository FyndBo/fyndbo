import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

function json(
  data: unknown,
  status = 200
) {
  return NextResponse.json(
    data,
    {
      status,
      headers: {
        'Cache-Control':
          'no-store',
      },
    }
  )
}

function normalizeEmail(
  value: unknown
) {
  if (
    typeof value !== 'string'
  ) {
    return ''
  }

  return value
    .trim()
    .toLowerCase()
}

function isValidEmail(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  )
}

async function brevoRequest(
  path: string,
  apiKey: string,
  options: RequestInit = {}
) {
  const response =
    await fetch(
      `https://api.brevo.com/v3${path}`,
      {
        ...options,

        headers: {
          accept:
            'application/json',

          'api-key':
            apiKey,

          ...(options.body
            ? {
                'Content-Type':
                  'application/json',
              }
            : {}),

          ...(options.headers ||
            {}),
        },

        cache:
          'no-store',
      }
    )

  const data =
    await response
      .json()
      .catch(
        () => null
      )

  return {
    response,
    data,
  }
}

function buildTestHtml(
  html: string,
  testEmail: string
) {
  const unsubscribeUrl =
    `https://fyndbo.se/avregistrera?email=${encodeURIComponent(
      testEmail
    )}`

  return html
    .replace(
      /\{\{\s*unsubscribe\s*\}\}/gi,
      unsubscribeUrl
    )
    .replace(
      /\{\{\s*mirror\s*\}\}/gi,
      'https://fyndbo.se'
    )
}

export async function POST(
  request: NextRequest
) {
  // ==========================================================
  // AUTH
  // ==========================================================

  const token =
    await getToken({
      req:
        request,

      secret:
        process.env
          .NEXTAUTH_SECRET,
    })

  if (
    !token ||
    token.role !==
      'admin'
  ) {
    return json(
      {
        error:
          'Du saknar behörighet att skicka nyhetsbrev.',
      },
      401
    )
  }

  // ==========================================================
  // ENV
  // ==========================================================

  const apiKey =
    process.env
      .BREVO_API_KEY

  const senderEmail =
    process.env
      .BREVO_SENDER_EMAIL ||
    'info@fyndbo.se'

  if (!apiKey) {
    console.error(
      'BREVO_API_KEY saknas.'
    )

    return json(
      {
        error:
          'Brevo är inte korrekt konfigurerat.',
      },
      500
    )
  }

  try {
    // ========================================================
    // BODY
    // ========================================================

    const body =
      await request.json()

    const listId =
      Number(
        body.listId
      )

    const subject =
      typeof body.subject ===
      'string'
        ? body.subject.trim()
        : ''

    const preheader =
      typeof body.preheader ===
      'string'
        ? body.preheader.trim()
        : ''

    const content =
      typeof body.content ===
      'string'
        ? body.content.trim()
        : ''

    const testEmail =
      normalizeEmail(
        body.testEmail
      )

    // ========================================================
    // COMMON VALIDATION
    // ========================================================

    if (
      subject.length < 2 ||
      subject.length > 200
    ) {
      return json(
        {
          error:
            'Ämnesraden saknas eller är för lång.',
        },
        400
      )
    }

    if (
      content.length < 20
    ) {
      return json(
        {
          error:
            'Nyhetsbrevet saknar innehåll.',
        },
        400
      )
    }

    if (
      testEmail &&
      !isValidEmail(
        testEmail
      )
    ) {
      return json(
        {
          error:
            'Testadressen är inte giltig.',
        },
        400
      )
    }

    // ========================================================
    // TESTUTSKICK
    //
    // Testmail går via Brevos transactional endpoint.
    //
    // Anledning:
    // En kampanj kräver riktiga campaign recipients.
    // Om den valda listan är tom kan Brevo annars svara:
    // "There are no contacts associated with the given
    // recipients info" redan när kampanjen skapas.
    //
    // Ett testmail ska kunna skickas även om listan är tom.
    // ========================================================

    if (testEmail) {
      const testHtml =
        buildTestHtml(
          content,
          testEmail
        )

      const {
        response:
          testResponse,
        data:
          testData,
      } =
        await brevoRequest(
          '/smtp/email',
          apiKey,
          {
            method:
              'POST',

            body:
              JSON.stringify({
                sender: {
                  email:
                    senderEmail,

                  name:
                    'FyndBo.se',
                },

                replyTo: {
                  email:
                    senderEmail,

                  name:
                    'FyndBo.se',
                },

                to: [
                  {
                    email:
                      testEmail,
                  },
                ],

                subject,

                htmlContent:
                  testHtml,

                tags: [
                  'fyndbo-newsletter-test',
                ],
              }),
          }
        )

      if (
        !testResponse.ok
      ) {
        console.error(
          'Brevo transactional test error:',
          testData
        )

        return json(
          {
            error:
              testData?.message ||
              'Testutskicket kunde inte skickas.',
          },
          502
        )
      }

      return json({
        success:
          true,

        mode:
          'test',

        sent:
          1,

        messageId:
          testData?.messageId ||
          null,

        message:
          `Testutskicket skickades till ${testEmail}.`,
      })
    }

    // ========================================================
    // RIKTIGT LISTUTSKICK
    // ========================================================

    if (
      !Number.isInteger(
        listId
      ) ||
      listId <= 0
    ) {
      return json(
        {
          error:
            'Välj en giltig mottagarlista.',
        },
        400
      )
    }

    // ========================================================
    // VERIFY LIST + GET COUNT
    // ========================================================

    const {
      response:
        listResponse,
      data:
        listData,
    } =
      await brevoRequest(
        `/contacts/lists/${listId}`,
        apiKey
      )

    if (
      !listResponse.ok
    ) {
      console.error(
        'Brevo list lookup error:',
        listData
      )

      return json(
        {
          error:
            'Mottagarlistan kunde inte hittas i Brevo.',
        },
        400
      )
    }

    const recipientCount =
      Number(
        listData?.totalSubscribers ||
          0
      )

    if (
      recipientCount <= 0
    ) {
      return json(
        {
          error:
            'Den valda Brevo-listan har inga prenumeranter ännu.',
        },
        400
      )
    }

    // ========================================================
    // CREATE BREVO EMAIL CAMPAIGN
    //
    // Riktiga nyhetsbrev använder campaign API så att listor,
    // unsubscribe, mirror och kampanjstatistik hanteras av Brevo.
    // ========================================================

    const campaignName =
      `FyndBo - ${subject}`
        .slice(
          0,
          120
        )

    const {
      response:
        createResponse,
      data:
        createData,
    } =
      await brevoRequest(
        '/emailCampaigns',
        apiKey,
        {
          method:
            'POST',

          body:
            JSON.stringify({
              name:
                campaignName,

              subject,

              previewText:
                preheader ||
                undefined,

              sender: {
                email:
                  senderEmail,

                name:
                  'FyndBo.se',
              },

              replyTo:
                senderEmail,

              htmlContent:
                content,

              recipients: {
                listIds: [
                  listId,
                ],
              },

              mirrorActive:
                true,

              tag:
                'fyndbo-newsletter',
            }),
        }
      )

    if (
      !createResponse.ok ||
      !createData?.id
    ) {
      console.error(
        'Brevo create campaign error:',
        createData
      )

      return json(
        {
          error:
            createData?.message ||
            'Brevo kunde inte skapa utskicket.',
        },
        502
      )
    }

    const campaignId =
      Number(
        createData.id
      )

    // ========================================================
    // SEND CAMPAIGN NOW
    // ========================================================

    const {
      response:
        sendResponse,
      data:
        sendData,
    } =
      await brevoRequest(
        `/emailCampaigns/${campaignId}/sendNow`,
        apiKey,
        {
          method:
            'POST',
        }
      )

    if (
      !sendResponse.ok
    ) {
      console.error(
        'Brevo campaign send error:',
        sendData
      )

      return json(
        {
          error:
            sendData?.message ||
            'Brevo kunde inte starta utskicket.',
        },
        502
      )
    }

    return json({
      success:
        true,

      mode:
        'campaign',

      campaignId,

      sent:
        recipientCount,

      message:
        recipientCount === 1
          ? 'Nyhetsbrevet har skickats till 1 prenumerant.'
          : `Nyhetsbrevet har skickats till ${recipientCount} prenumeranter.`,
    })
  } catch (error) {
    console.error(
      'Brevo send route error:',
      error
    )

    return json(
      {
        error:
          'Ett serverfel inträffade när utskicket skulle skickas.',
      },
      500
    )
  }
}
