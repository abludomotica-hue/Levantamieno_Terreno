import { auth } from '@/../auth'
import { redirect } from 'next/navigation'

/**
 * Obtiene el usuario de la sesión actual (Server Components / Server Actions).
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

/**
 * Requiere autenticación. Redirige a /login si no está autenticado.
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

/**
 * Requiere un rol específico. Redirige a /dashboard si no tiene permisos.
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard')
  }
  return user
}
