'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

interface QuoteItemInput {
  name: string
  price: number
  quantity: number
}

interface SaveQuoteInput {
  items: QuoteItemInput[]
  notes?: string
}

/**
 * Obtiene la cotización asociada a una inspección.
 */
export async function getQuoteByInspection(inspectionId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  return prisma.quote.findUnique({
    where: { inspectionId },
    include: {
      items: {
        orderBy: { name: 'asc' }
      },
      inspection: {
        include: {
          client: true,
          technician: {
            select: { name: true, email: true }
          }
        }
      }
    }
  })
}

import { QuoteService } from '@/services/QuoteService'

/**
 * Guarda o actualiza la cotización e ítems asociados a una inspección.
 */
export async function createOrUpdateQuote(inspectionId: string, data: SaveQuoteInput) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const inspection = await prisma.inspection.findUnique({ where: { id: inspectionId } })
  if (!inspection) {
    throw new Error('Inspección no encontrada.')
  }
  
  if (inspection.technicianId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPERVISOR') {
    throw new Error('No tienes permisos para modificar esta cotización.')
  }

  const quote = await QuoteService.createOrUpdateQuote(inspectionId, data)

  revalidatePath('/inspections')
  revalidatePath(`/inspections/${inspectionId}`)
  revalidatePath(`/inspections/${inspectionId}/quote`)
  revalidatePath('/dashboard')

  return quote
}

/**
 * LÓGICA INTELIGENTE: Analiza la inspección y sugiere una pre-carga de productos
 * cruzándolos con los productos disponibles en el catálogo general.
 */
export async function getPreloadedItemsFromInspection(inspectionId: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  return QuoteService.getPreloadedItemsFromInspection(inspectionId)
}
