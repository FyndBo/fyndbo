import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
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
  if (
    email.length < 5 ||
    email.length > 254
  ) {
    return false
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  )
}

// ============================================================
// TA BORT FRÅN BREVO
//
// Just nu används Brevo för FyndBos nyhetsbrev,
// därför tar vi bort kontakten helt.
//
// Om Brevo senare används för t.ex. ordermail,
// kontomail eller andra transaktionsmail bör detta
// i stället byggas om till endast marketing opt-out.
// ============================================================

async function removeFromBrevo(
  email: string
) {
  const apiKey =
    process.env.BREVO_API_KEY

  if (!apiKey) {
    throw new Error(
      'BREVO_API_KEY saknas.'
    )
  }

  const response =
    await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(
        email
      )}`,
      {
        method:
          'DELETE',

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

  // Om kontakten redan är borta räknar vi det som lyckat.
  if (
    response.status ===
    404
  ) {
    return
  }

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null
        )

    console.error(
      'Brevo unsubscribe error:',
      data
    )

    throw new Error(
      data?.message ||
        'Brevo kunde inte avregistrera kontakten.'
    )
  }
}

// ============================================================
// POST
// ============================================================

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json()

    const email =
      normalizeEmail(
        body.email
      )

    if (
      !isValidEmail(email)
    ) {
      return json(
        {
          error:
            'Ange en giltig e-postadress.',
        },
        400
      )
    }

    // ========================================================
    // BREVO FÖRST
    //
    // Viktigast är att adressen inte längre kan få mail.
    // ========================================================

    try {
      await removeFromBrevo(
        email
      )
    } catch (error) {
      console.error(
        'Could not remove Brevo contact:',
        error
      )

      return json(
        {
          error:
            'Vi kunde inte slutföra avregistreringen just nu. Försök igen om en stund.',
        },
        502
      )
    }

    // ========================================================
    // SUPABASE
    // ========================================================

    const {
      error,
    } =
      await supabaseAdmin
        .from(
          'waitlist'
        )
        .delete()
        .eq(
          'email',
          email
        )

    if (error) {
      console.error(
        'Supabase unsubscribe error:',
        error
      )

      // Kontakten är redan borttagen från Brevo.
      // Alltså kommer den inte längre få nyhetsbrev.
      // Vi loggar databasfelet men behandlar ändå
      // avregistreringen som lyckad.
    }

    return json({
      success: true,

      message:
        'E-postadressen har avregistrerats från FyndBos nyhetsbrev.',
    })
  } catch (error) {
    console.error(
      'Unsubscribe API error:',
      error
    )

    return json(
      {
        error:
          'Ett serverfel inträffade.',
      },
      500
    )
  }
}