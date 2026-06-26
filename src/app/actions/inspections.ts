'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { inspectionSchema, InspectionFormData } from '@/lib/validations/inspection'
import { revalidatePath } from 'next/cache'
import { InspectionService } from '@/services/InspectionService'

/**
 * Crea un nuevo levantamiento técnico asociado a un cliente.
 */
export async function createInspection(data: InspectionFormData) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const validated = inspectionSchema.safeParse(data)
  if (!validated.success) {
    console.error('Validation errors:', validated.error.flatten())
    throw new Error('Datos de inspección inválidos.')
  }

  const inspection = await InspectionService.createInspection(validated.data, user.id)

  if (validated.data.visitId) {
    revalidatePath('/schedule')
  }

  revalidatePath('/inspections')
  revalidatePath('/dashboard')
  revalidatePath(`/clients/${validated.data.clientId}`)

  return inspection
}

/**
 * Actualiza una inspección existente.
 */
export async function updateInspection(id: string, data: InspectionFormData) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const existing = await prisma.inspection.findUnique({ where: { id } })
  if (!existing) {
    throw new Error('Inspección no encontrada.')
  }

  if (existing.technicianId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPERVISOR') {
    throw new Error('No tienes permisos para modificar esta inspección.')
  }

  const validated = inspectionSchema.safeParse(data)
  if (!validated.success) {
    console.error('Validation errors:', validated.error.flatten())
    throw new Error('Datos de inspección inválidos.')
  }

  await InspectionService.updateInspection(id, validated.data)

  if (existing.visitId || validated.data.visitId) {
    revalidatePath('/schedule')
  }

  revalidatePath('/inspections')
  revalidatePath(`/inspections/${id}`)
  revalidatePath('/dashboard')
  revalidatePath(`/clients/${validated.data.clientId}`)
}
