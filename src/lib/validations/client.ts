import { z } from 'zod'

export const clientSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres'),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 caracteres'),
  email: z
    .string()
    .email('Ingrese un correo electrónico válido')
    .or(z.literal(''))
    .optional(),
  notes: z
    .string()
    .optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>
