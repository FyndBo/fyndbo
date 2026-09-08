import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
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
// BREVO
// ============================================================

async function syncContactToBrevo(
  email: string
) {
  const apiKey =
    process.env.BREVO_API_KEY

  const rawListId =
    process.env.BREVO_WAITLIST_LIST_ID

  const listId =
    rawListId
      ? Number(rawListId)
      : null

  if (!apiKey) {
    throw new Error(
      'BREVO_API_KEY saknas.'
    )
  }

  if (
    !listId ||
    !Number.isInteger(
      listId
    ) ||
    listId <= 0
  ) {
    throw new Error(
      'BREVO_WAITLIST_LIST_ID saknas eller är ogiltigt.'
    )
  }

  const response =
    await fetch(
      'https://api.brevo.com/v3/contacts',
      {
        method: 'POST',

        headers: {
          accept:
            'application/json',

          'content-type':
            'application/json',

          'api-key':
            apiKey,
        },

        body:
          JSON.stringify({
            email,

            listIds: [
              listId,
            ],

            updateEnabled:
              true,
          }),

        cache:
          'no-store',
      }
    )

  // Brevo kan svara med olika success-status
  // beroende på om kontakten skapades eller uppdaterades.
  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null
        )

    console.error(
      'Brevo contact sync error:',
      data
    )

    throw new Error(
      data?.message ||
        'Brevo kunde inte synkronisera kontakten.'
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
    // SPARA I SUPABASE
    // ========================================================

    const {
      error:
        insertError,
    } =
      await supabaseAdmin
        .from(
          'waitlist'
        )
        .insert({
          email,

          created_at:
            new Date().toISOString(),
        })

    let alreadyRegistered =
      false

    if (insertError) {
      // Unique constraint:
      // adressen finns redan.
      if (
        insertError.code ===
        '23505'
      ) {
        alreadyRegistered =
          true
      } else {
        console.error(
          'Supabase waitlist error:',
          insertError
        )

        return json(
          {
            error:
              'Kunde inte registrera e-postadressen.',
          },
          500
        )
      }
    }

    // ========================================================
    // SYNKA MED BREVO
    // ========================================================

    try {
      await syncContactToBrevo(
        email
      )
    } catch (error) {
      console.error(
        'Brevo sync failed:',
        error
      )

      // Om adressen precis skapades men Brevo misslyckades
      // rullar vi tillbaka registreringen så användaren kan
      // försöka igen utan att systemen hamnar ur synk.
      if (
        !alreadyRegistered
      ) {
        const {
          error:
            rollbackError,
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

        if (
          rollbackError
        ) {
          console.error(
            'Rollback failed:',
            rollbackError
          )
        }
      }

      return json(
        {
          error:
            'Registreringen kunde inte slutföras just nu. Försök igen om en stund.',
        },
        502
      )
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return json({
      success: true,

      alreadyRegistered,

      message:
        alreadyRegistered
          ? 'Du är redan registrerad och din prenumeration är uppdaterad.'
          : 'Tack! Du är nu registrerad för nyheter från FyndBo.',
    })
  } catch (error) {
    console.error(
      'Save email API error:',
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