import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

function json(
  data: unknown,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export async function GET(
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
        process.env.NEXTAUTH_SECRET,
    })

  if (
    !token ||
    token.role !==
      'admin'
  ) {
    return json(
      {
        error:
          'Du saknar behörighet.',
      },
      401
    )
  }

  // ==========================================================
  // CONFIG
  // ==========================================================

  const apiKey =
    process.env.BREVO_API_KEY

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

  // ==========================================================
  // BREVO
  // ==========================================================

  try {
    const response =
      await fetch(
        'https://api.brevo.com/v3/contacts/lists?limit=50&offset=0&sort=desc',
        {
          headers: {
            accept:
              'application/json',

            'api-key':
              apiKey,
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

    if (!response.ok) {
      console.error(
        'Brevo list API error:',
        data
      )

      return json(
        {
          error:
            'Kunde inte hämta Brevo-listor.',
        },
        502
      )
    }

    const lists =
      Array.isArray(
        data?.lists
      )
        ? data.lists.map(
            (list: any) => ({
              id:
                list.id,

              name:
                list.name,

              totalSubscribers:
                list.totalSubscribers ??
                0,

              totalBlacklisted:
                list.totalBlacklisted ??
                0,
            })
          )
        : []

    return json({
      lists,
    })
  } catch (error) {
    console.error(
      'Brevo lists error:',
      error
    )

    return json(
      {
        error:
          'Kunde inte ansluta till Brevo.',
      },
      502
    )
  }
}