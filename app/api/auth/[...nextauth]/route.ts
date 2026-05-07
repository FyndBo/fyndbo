import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.password === process.env.ADMIN_PASSWORD) {
          return {
            id: '1',
            email: credentials?.email || 'admin@fyndbo.se',
            name: 'Admin',
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const userEmail = user.email
        if (!userEmail) return false

        const { data, error } = await supabaseAdmin
          .from('admin_users')
          .select('email')
          .eq('email', userEmail)
          .single()

        if (error || !data) {
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = 'admin'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }