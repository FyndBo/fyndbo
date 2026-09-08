import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================
// JSON
// ============================================================

function json(
  data: unknown,
  status = 200
) {
  return NextResponse.json(data, {
    status,

    headers: {
      'Cache-Control':
        'no-store, no-cache, must-revalidate',
    },
  })
}

// ============================================================
// GET – HÄMTA ENSKILD AKTIV BOSTAD
// ============================================================

export async function GET(
  _request: NextRequest,

  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    // Moderna Next.js Route Handlers
    // använder async params.
    const { id: rawId } =
      await params

    const id =
      Number.parseInt(
        rawId,
        10
      )

    if (
      !Number.isFinite(id) ||
      id <= 0
    ) {
      return json(
        {
          error:
            'Ogiltigt bostads-ID.',
        },
        400
      )
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      if (error) {
        console.warn(
          `Property ${id} hittades inte:`,
          error.code
        )
      }

      return json(
        {
          error:
            'Bostaden hittades inte.',
        },
        404
      )
    }

    return json({
      property: data,
    })
  } catch (error) {
    console.error(
      'GET property error:',
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