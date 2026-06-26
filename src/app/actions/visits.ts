'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

interface CreateVisitData {
  clientId: string
  technicianId: string
  visitDate: Date
  notes?: string
}

/**
 * Crea una nueva visita técnica programada.
 */
export async function createVisit(data: CreateVisitData) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const visit = await prisma.scheduleVisit.create({
    data: {
      clientId: data.clientId,
      technicianId: data.technicianId,
      visitDate: new Date(data.visitDate),
      status: 'PENDING',
      notes: data.notes || null,
    },
  })

  revalidatePath('/schedule')
  revalidatePath('/dashboard')
  
  return visit
}

/**
 * Obtiene las visitas técnicas según filtros (técnico, estado).
 */
export async function getVisits(filters?: { technicianId?: string; status?: string }) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const where: any = {}
  if (filters?.technicianId) {
    where.technicianId = filters.technicianId
  }
  if (filters?.status) {
    where.status = filters.status
  }

  return prisma.scheduleVisit.findMany({
    where,
    include: {
      client: true,
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      inspection: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      visitDate: 'asc',
    },
  })
}

/**
 * Actualiza el estado de una visita técnica.
 */
export async function updateVisitStatus(id: string, status: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const existing = await prisma.scheduleVisit.findUnique({ where: { id } })
  if (!existing) throw new Error('Visita no encontrada.')
  
  if (existing.technicianId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPERVISOR') {
    throw new Error('No tienes permisos sobre esta visita.')
  }

  const visit = await prisma.scheduleVisit.update({
    where: { id },
    data: { status },
  })

  revalidatePath('/schedule')
  revalidatePath('/dashboard')
  
  return visit
}

/**
 * Elimina una visita técnica agendada.
 */
export async function deleteVisit(id: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const existing = await prisma.scheduleVisit.findUnique({ where: { id } })
  if (!existing) throw new Error('Visita no encontrada.')
  
  if (existing.technicianId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPERVISOR') {
    throw new Error('No tienes permisos sobre esta visita.')
  }

  await prisma.scheduleVisit.delete({
    where: { id },
  })

  revalidatePath('/schedule')
  revalidatePath('/dashboard')
}

/**
 * Obtiene la lista de técnicos disponibles para asignar visitas.
 */
export async function getTechnicians() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  return prisma.user.findMany({
    where: {
      role: 'TECHNICIAN',
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })
}
