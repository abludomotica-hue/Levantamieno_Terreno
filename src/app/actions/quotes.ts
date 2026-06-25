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

/**
 * Guarda o actualiza la cotización e ítems asociados a una inspección.
 */
export async function createOrUpdateQuote(inspectionId: string, data: SaveQuoteInput) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const quote = await prisma.$transaction(async (tx) => {
    // Buscar si ya existe la cotización
    const existingQuote = await tx.quote.findUnique({
      where: { inspectionId }
    })

    if (existingQuote) {
      // Eliminar ítems anteriores
      await tx.quoteItem.deleteMany({
        where: { quoteId: existingQuote.id }
      })

      // Actualizar cotización y crear nuevos ítems
      return tx.quote.update({
        where: { id: existingQuote.id },
        data: {
          totalAmount,
          notes: data.notes || null,
          items: {
            create: data.items.map(item => ({
              name: item.name,
              price: Number(item.price),
              quantity: Number(item.quantity),
              total: Number(item.price) * Number(item.quantity)
            }))
          }
        },
        include: { items: true }
      })
    } else {
      // Crear nueva cotización
      return tx.quote.create({
        data: {
          inspectionId,
          totalAmount,
          notes: data.notes || null,
          items: {
            create: data.items.map(item => ({
              name: item.name,
              price: Number(item.price),
              quantity: Number(item.quantity),
              total: Number(item.price) * Number(item.quantity)
            }))
          }
        },
        include: { items: true }
      })
    }
  })

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

  // 1. Obtener la inspección
  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: {
      cameras: true
    }
  })

  if (!inspection) {
    throw new Error('No se encontró la inspección especificada.')
  }

  // Parsear arrays de strings guardados como JSON
  const recordingTypes = JSON.parse(inspection.recordingType || '[]')
  const additionalEquipment = JSON.parse(inspection.additionalEquipment || '[]')

  // 2. Obtener los productos del catálogo
  const catalog = await prisma.product.findMany()
  const findProductBySku = (sku: string) => catalog.find(p => p.sku === sku)

  const preloadedItems: QuoteItemInput[] = []

  // --- Regla 1: Cámaras de seguridad ---
  const cameraCount = inspection.cameras.length
  if (cameraCount > 0) {
    // Por defecto sugerimos cámara domo
    const domoCam = findProductBySku('CAM-IP-HIK4M-D')
    preloadedItems.push({
      name: domoCam?.name || 'Cámara IP Hikvision 4MP Domo',
      price: domoCam?.price || 45000,
      quantity: cameraCount
    })

    // Añadimos las cajas estancas para instalación eléctrica de cada cámara
    const junctionBox = findProductBySku('ACC-CAJA-ESTAN')
    preloadedItems.push({
      name: junctionBox?.name || 'Caja Estanca de Conexión CCTV',
      price: junctionBox?.price || 2500,
      quantity: cameraCount
    })

    // Añadimos mano de obra por cada cámara
    const installService = findProductBySku('SRV-INST-CAM')
    preloadedItems.push({
      name: installService?.name || 'Servicio de Instalación y Configuración por Cámara',
      price: installService?.price || 25000,
      quantity: cameraCount
    })
  }

  // --- Regla 2: Grabador NVR ---
  if (recordingTypes.includes('nvr') && cameraCount > 0) {
    let nvrProduct = null
    if (cameraCount <= 4) {
      nvrProduct = findProductBySku('NVR-HIK-4CH')
    } else {
      nvrProduct = findProductBySku('NVR-HIK-8CH')
    }

    if (nvrProduct) {
      preloadedItems.push({
        name: nvrProduct.name,
        price: nvrProduct.price,
        quantity: 1
      })
    }

    // Añadimos disco duro según el tamaño sugerido
    let hddProduct = null
    if (inspection.recordingDiskSize === '1tb') {
      hddProduct = findProductBySku('HDD-WD-PURP1T')
    } else {
      hddProduct = findProductBySku('HDD-WD-PURP2T')
    }

    if (hddProduct) {
      preloadedItems.push({
        name: hddProduct.name,
        price: hddProduct.price,
        quantity: 1
      })
    }
  }

  // --- Regla 3: Metraje de Cableado UTP ---
  const totalCable = inspection.distanceTotalCable || 0
  if (totalCable > 0) {
    const cableProduct = findProductBySku('CAB-UTP-METER')
    preloadedItems.push({
      name: cableProduct?.name || 'Bobina de Cable UTP Cat6 (por metro)',
      price: cableProduct?.price || 450,
      quantity: Math.ceil(totalCable)
    })
  }

  // --- Regla 4: Equipamiento Adicional (UPS) ---
  if (additionalEquipment.includes('ups')) {
    const upsProduct = findProductBySku('POW-UPS-850')
    if (upsProduct) {
      preloadedItems.push({
        name: upsProduct.name,
        price: upsProduct.price,
        quantity: 1
      })
    }
  }

  // --- Regla 5: Configuración final de red ---
  if (cameraCount > 0) {
    const netConfig = findProductBySku('SRV-CONF-RED')
    preloadedItems.push({
      name: netConfig?.name || 'Configuración de Red y Visualización Móvil',
      price: netConfig?.price || 15000,
      quantity: 1
    })
  }

  return preloadedItems
}
