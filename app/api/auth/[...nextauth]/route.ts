import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import bcrypt from 'bcryptjs'

// ============================================================
// TYPER – Viktigt för att role ska finnas i session
// ============================================================
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string  // ← Detta gör att role finns i session
    }
  }
  interface User {
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-post', type: 'email' },
        password: { label: 'Lösenord', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Authorize kallad med:', credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-post och lösenord krävs')
        }

        const cleanEmail = credentials.email.toLowerCase().trim()

        // 1. Kolla i admin_users-tabellen
        const { data: adminUser, error } = await supabaseAdmin
          .from('admin_users')
          .select('email, password_hash, role')
          .eq('email', cleanEmail)
          .single()

        if (adminUser) {
          // Verifiera lösenord
          if (!adminUser.password_hash) {
            throw new Error('Detta konto använder Google-inloggning')
          }

          const isValid = await bcrypt.compare(credentials.password, adminUser.password_hash)
          if (!isValid) {
            throw new Error('Fel lösenord')
          }

          console.log('✅ Admin hittad i databasen, roll:', adminUser.role)

          return {
            id: adminUser.email,
            email: adminUser.email,
            name: adminUser.email.split('@')[0],
            role: adminUser.role || 'admin',  // ← HÄMTAR ROLLEN FRÅN DATABASEN
          }
        }

        // 2. Fallback: Super-admin
        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return {
            id: cleanEmail,
            email: cleanEmail,
            name: 'Admin',
            role: 'admin',
          }
        }

        throw new Error('Inget konto hittades')
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Lägg till role i JWT-token
      if (user) {
        token.role = user.role
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      // Lägg till role i session
      if (session.user) {
        session.user.role = token.role as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 timmar
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }