import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
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
        email: { 
          label: 'E-post', 
          type: 'email', 
          placeholder: 'admin@exempel.se' 
        },
        password: { 
          label: 'Lösenord', 
          type: 'password',
          placeholder: '••••••••' 
        },
      },
      async authorize(credentials) {
        // Kräv BÅDE email och lösenord
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-post och lösenord krävs')
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(credentials.email)) {
          throw new Error('Ogiltig e-postadress')
        }

        // Kolla admin_users först
        const { data: adminUser } = await supabaseAdmin
          .from('admin_users')
          .select('email, password_hash')
          .eq('email', credentials.email.toLowerCase().trim())
          .single()

        if (adminUser) {
          if (!adminUser.password_hash) {
            throw new Error('Detta konto använder Google-inloggning. Klicka på "Logga in med Google".')
          }

          const isValidPassword = await bcrypt.compare(credentials.password, adminUser.password_hash)
          if (!isValidPassword) {
            throw new Error('Fel lösenord')
          }

          return {
            id: adminUser.email,
            email: adminUser.email,
            name: adminUser.email.split('@')[0],
            role: 'admin',
          }
        }

        // Fallback: super-admin lösenord (ADMIN_PASSWORD i .env)
        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return {
            id: '1',
            email: credentials.email.toLowerCase().trim(),
            name: 'Admin',
            role: 'admin',
          }
        }

        throw new Error('Inget konto hittades med denna e-post')
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const userEmail = user.email
        if (!userEmail) return false

        // Kontrollera att användaren finns i admin_users
        const { data, error } = await supabaseAdmin
          .from('admin_users')
          .select('email')
          .eq('email', userEmail.toLowerCase().trim())
          .single()

        if (error || !data) {
          console.log(`Inloggning nekad: ${userEmail} finns inte i admin_users`)
          return false // Neka åtkomst
        }
        
        user.role = 'admin'
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.email = token.email as string
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
    maxAge: 24 * 60 * 60, // 24 timmar
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }