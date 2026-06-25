'use server'

import prisma from '@/lib/prisma'
import { clientSchema, ClientFormData } from '@/lib/validations/client'
import { revalidatePath } from 'next/cache'

/**
 * Registra un nuevo cliente en la base de datos.
 */
export async function createClient(data: ClientFormData) {
  const validated = clientSchema.safeParse(data)

  if (!validated.success) {
    throw new Error('Datos de cliente inválidos.')
  }

  const client = await prisma.client.create({
    data: {
      name: validated.data.name,
      address: validated.data.address,
      phone: validated.data.phone,
      email: validated.data.email || null,
      notes: validated.data.notes || null,
    },
  })

  revalidatePath('/clients')
  revalidatePath('/dashboard')
  
  return client
}

/**
 * Actualiza los datos de un cliente existente.
 */
export async function updateClient(id: string, data: ClientFormData) {
  const validated = clientSchema.safeParse(data)

  if (!validated.success) {
    throw new Error('Datos de cliente inválidos.')
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      name: validated.data.name,
      address: validated.data.address,
      phone: validated.data.phone,
      email: validated.data.email || null,
      notes: validated.data.notes || null,
    },
  })

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  revalidatePath('/dashboard')

  return client
}
