'use server'

import { signIn, signOut } from '@/../auth'
import { AuthError } from 'next-auth'

/**
 * Acción de servidor para iniciar sesión.
 */
export async function loginAction(prevState: string | undefined, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return 'Por favor complete todos los campos.'
    }

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Correo o contraseña incorrectos.'
        default:
          return 'Error de autenticación. Intente nuevamente.'
      }
    }
    throw error // Re-lanzar redirecciones de Next.js
  }
}

/**
 * Acción de servidor para cerrar sesión.
 */
export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
