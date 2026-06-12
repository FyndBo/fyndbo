import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import bcrypt from 'bcryptjs'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-post', type: 'email' },
        password: { label: 'Lösenord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-post och lösenord krävs')
        }

        const { data: adminUser } = await supabaseAdmin
          .from('admin_users')
          .select('email, password_hash, role')
          .eq('email', credentials.email.toLowerCase().trim())
          .single()

        if (adminUser) {
          if (!adminUser.password_hash) {
            throw new Error('Detta konto använder Google-inloggning.')
          }
          const isValidPassword = await bcrypt.compare(credentials.password, adminUser.password_hash)
          if (!isValidPassword) throw new Error('Fel lösenord')

          return {
            id: adminUser.email,
            email: adminUser.email,
            name: adminUser.email.split('@')[0],
            role: adminUser.role || 'admin',
          }
        }

        // Fallback super-admin (ADMIN_PASSWORD)
        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return {
            id: '1',
            email: credentials.email.toLowerCase().trim(),
            name: 'Admin',
            role: 'admin',
          }
        }

        throw new Error('Inget konto hittades')
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const { data } = await supabaseAdmin
          .from('admin_users')
          .select('email, role')
          .eq('email', user.email?.toLowerCase().trim())
          .single()
        if (!data) return false
        user.role = data.role || 'admin'
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }