import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || 
                           nextUrl.pathname.startsWith('/clients') || 
                           nextUrl.pathname.startsWith('/inspections') || 
                           nextUrl.pathname.startsWith('/reports')
      const isOnLogin = nextUrl.pathname === '/login'
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to login
      } else if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
