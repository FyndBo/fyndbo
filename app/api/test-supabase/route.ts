import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test 1: Kan vi nå Supabase?
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .limit(1)

    if (tablesError) {
      return NextResponse.json({
        success: false,
        error: 'Supabase error',
        message: tablesError.message,
        code: tablesError.code,
        details: tablesError.details,
        hint: tablesError.hint
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase fungerar!',
      data: tables,
      count: tables?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Exception',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}