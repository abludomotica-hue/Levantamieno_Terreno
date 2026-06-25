import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo o usuario es requerido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
})

export type LoginFormData = z.infer<typeof loginSchema>
