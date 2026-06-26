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
      const domoCam = findProductBySku('CAM-IP-HIK4M-D')
      preloadedItems.push({
        name: domoCam?.name || 'Cámara IP Hikvision 4MP Domo',
        price: domoCam?.price || 45000,
        quantity: cameraCount
      })

      const junctionBox = findProductBySku('ACC-CAJA-ESTAN')
      preloadedItems.push({
        name: junctionBox?.name || 'Caja Estanca de Conexión CCTV',
        price: junctionBox?.price || 2500,
        quantity: cameraCount
      })

      const installService = findProductBySku('SRV-INST-CAM')
      preloadedItems.push({
        name: installService?.name || 'Servicio de Instalación y Configuración por Cámara',
        price: installService?.price || 25000,
        quantity: cameraCount
      })
    }

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

    const totalCable = inspection.distanceTotalCable || 0
    if (totalCable > 0) {
      const cableProduct = findProductBySku('CAB-UTP-METER')
      preloadedItems.push({
        name: cableProduct?.name || 'Bobina de Cable UTP Cat6 (por metro)',
        price: cableProduct?.price || 450,
        quantity: Math.ceil(totalCable)
      })
    }

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
}
