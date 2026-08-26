import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Tillåt ALLA att se login-sidan
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Skydda alla /admin-rutter
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    console.log('🔍 Middleware - Token:', token?.email, 'Role:', token?.role)

    if (!token) {
      console.log('❌ Ingen token - omdirigerar till login')
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Tillåt alla med token (även utan admin-roll för test)
    console.log('✅ Token finns - tillåter åtkomst')
    return NextResponse.next()
  }

  // Skydda alla /api/admin-rutter
  if (pathname.startsWith('/api/admin')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}