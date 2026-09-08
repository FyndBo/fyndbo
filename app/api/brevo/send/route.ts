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

async function ensureBrevoContact(
  email: string,
  apiKey: string
) {
  const {
    response,
    data,
  } =
    await brevoRequest(
      '/contacts',
      apiKey,
      {
        method:
          'POST',

        body:
          JSON.stringify({
            email,

            // Om kontakten redan finns gör Brevo detta till en
            // uppdatering i stället för att ge duplicate-fel.
            updateEnabled:
              true,
          }),
      }
    )

  if (response.ok) {
    return
  }

  throw new Error(
    data?.message ||
      'Testadressen kunde inte registreras som testkontakt i Brevo.'
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
    // VALIDATION
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

    // För ett riktigt utskick måste listan innehålla kontakter.
    // Ett testutskick får däremot skickas även om huvudlistan är tom.
    if (
      !testEmail &&
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
    // TEST CONTACT
    //
    // Brevo kräver att testmottagaren är en kontakt i kontot.
    // Vi säkerställer därför att adressen finns i Brevo innan
    // kampanjens sendTest-endpoint anropas.
    //
    // Den läggs INTE automatiskt i FyndBos nyhetsbrevslista.
    // ========================================================

    if (testEmail) {
      try {
        await ensureBrevoContact(
          testEmail,
          apiKey
        )
      } catch (error) {
        console.error(
          'Brevo test contact error:',
          error
        )

        return json(
          {
            error:
              error instanceof
              Error
                ? error.message
                : 'Testadressen kunde inte förberedas i Brevo.',
          },
          502
        )
      }
    }

    // ========================================================
    // CREATE BREVO EMAIL CAMPAIGN
    // ========================================================

    const campaignName =
      `${
        testEmail
          ? 'TEST - '
          : ''
      }FyndBo - ${subject}`
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
    // TEST
    // ========================================================

    if (testEmail) {
      const {
        response:
          testResponse,
        data:
          testData,
      } =
        await brevoRequest(
          `/emailCampaigns/${campaignId}/sendTest`,
          apiKey,
          {
            method:
              'POST',

            body:
              JSON.stringify({
                emailTo: [
                  testEmail,
                ],
              }),
          }
        )

      if (
        !testResponse.ok
      ) {
        console.error(
          'Brevo test send error:',
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

        campaignId,

        sent:
          1,

        message:
          `Testutskicket skickades till ${testEmail}.`,
      })
    }

    // ========================================================
    // SEND NOW
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
