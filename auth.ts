import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { loginSchema } from '@/lib/validations/auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data
        
        // Buscar por email (o username en el caso de 'admin')
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email },
              { email: email.toLowerCase() }
            ]
          }
        })

        if (!user) return null

        const passwordsMatch = await bcrypt.compare(password, user.password)
        if (passwordsMatch) {
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
