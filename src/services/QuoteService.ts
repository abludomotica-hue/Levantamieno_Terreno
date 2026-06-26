import prisma from '@/lib/prisma'

export interface QuoteItemInput {
  name: string
  price: number
  quantity: number
}

export interface SaveQuoteInput {
  items: QuoteItemInput[]
  notes?: string
}

export class QuoteService {
  /**
   * Guarda o actualiza la cotización e ítems asociados a una inspección en la base de datos.
   */
  static async createOrUpdateQuote(inspectionId: string, data: SaveQuoteInput) {
    const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return prisma.$transaction(async (tx) => {
      const existingQuote = await tx.quote.findUnique({
        where: { inspectionId }
      })

      if (existingQuote) {
        await tx.quoteItem.deleteMany({
          where: { quoteId: existingQuote.id }
        })

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
  }

  /**
   * Analiza la inspección y sugiere una pre-carga de productos
   * cruzándolos con los productos disponibles en el catálogo general.
   */
  static async getPreloadedItemsFromInspection(inspectionId: string) {
    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: {
        cameras: true
      }
    })

    if (!inspection) {
      throw new Error('No se encontró la inspección especificada.')
    }

    const recordingTypes = Array.isArray(inspection.recordingType) ? inspection.recordingType as string[] : []
    const additionalEquipment = Array.isArray(inspection.additionalEquipment) ? inspection.additionalEquipment as string[] : []

    const catalog = await prisma.product.findMany()
    const findProductBySku = (sku: string) => catalog.find(p => p.sku === sku)

    const preloadedItems: QuoteItemInput[] = []

    const cameraCount = inspection.cameras.length
    if (cameraCount > 0) {
      // CAM-001: Cámara IP Domo 2MP WiFi Interior (cámara base)
      const domoCam = findProductBySku('CAM-001')
      preloadedItems.push({
        name: domoCam?.name || 'Cámara IP Domo 2MP WiFi Interior',
        price: domoCam?.price || 39990,
        quantity: cameraCount
      })

      // SRV-001: Instalación por cámara
      const installService = findProductBySku('SRV-001')
      preloadedItems.push({
        name: installService?.name || 'Instalación Cámara IP (Precio unitario)',
        price: installService?.price || 25000,
        quantity: cameraCount
      })

      // OTR-002: Soporte universal por cámara
      const soporte = findProductBySku('OTR-002')
      if (soporte) {
        preloadedItems.push({
          name: soporte.name,
          price: soporte.price,
          quantity: cameraCount
        })
      }
    }

    // NVR según cantidad de cámaras
    if ((recordingTypes.includes('nvr') || recordingTypes.includes('local')) && cameraCount > 0) {
      let nvrProduct = null
      if (cameraCount <= 4) {
        nvrProduct = findProductBySku('NVR-001') // NVR 4 Canales 4K con HDD 1TB
      } else if (cameraCount <= 8) {
        nvrProduct = findProductBySku('NVR-002') // NVR 8 Canales 4K PoE con HDD 2TB
      } else {
        nvrProduct = findProductBySku('NVR-003') // NVR 16 Canales 4K con HDD 4TB
      }

      if (nvrProduct) {
        preloadedItems.push({
          name: nvrProduct.name,
          price: nvrProduct.price,
          quantity: 1
        })
      }

      // SRV-002: Configuración y puesta en marcha NVR
      const nvrConfig = findProductBySku('SRV-002')
      if (nvrConfig) {
        preloadedItems.push({
          name: nvrConfig.name,
          price: nvrConfig.price,
          quantity: 1
        })
      }
    }

    // Cable UTP Cat6 según distancia total
    const totalCable = inspection.distanceTotalCable || 0
    if (totalCable > 0) {
      // NET-004: Cable UTP Cat6 Exterior 305m (Bobina) — calculamos bobinas necesarias
      const cableProduct = findProductBySku('NET-004')
      const bobinas = Math.max(1, Math.ceil(totalCable / 305))
      preloadedItems.push({
        name: cableProduct?.name || 'Cable UTP Cat6 Exterior 305m (Bobina)',
        price: cableProduct?.price || 49990,
        quantity: bobinas
      })

      // SRV-003: Tendido de cableado por metro
      const cableTendido = findProductBySku('SRV-003')
      if (cableTendido) {
        preloadedItems.push({
          name: cableTendido.name,
          price: cableTendido.price,
          quantity: Math.ceil(totalCable)
        })
      }
    }

    // Switch PoE si hay más de 2 cámaras
    if (cameraCount >= 3) {
      const switchPoe = findProductBySku('NET-001') // Switch PoE 8 Puertos
      if (switchPoe) {
        preloadedItems.push({
          name: switchPoe.name,
          price: switchPoe.price,
          quantity: 1
        })
      }
    }

    // UPS si está en equipamiento adicional
    if (additionalEquipment.includes('ups')) {
      const upsProduct = findProductBySku('PWR-002') // UPS 1000VA para DVR/NVR
      if (upsProduct) {
        preloadedItems.push({
          name: upsProduct.name,
          price: upsProduct.price,
          quantity: 1
        })
      }
    }

    return preloadedItems
  }
}
