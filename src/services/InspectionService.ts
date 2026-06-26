import prisma from '@/lib/prisma'
import { InspectionFormData } from '@/lib/validations/inspection'

export class InspectionService {
  /**
   * Crea un nuevo levantamiento técnico en la base de datos.
   */
  static async createInspection(data: InspectionFormData, technicianId: string) {
    const { cameras, photos, signature, ...rest } = data

    const inspection = await prisma.inspection.create({
      data: {
        clientId: rest.clientId,
        visitId: rest.visitId || null,
        technicianId,
        status: rest.status,
        visitDate: rest.visitDate,
        latitude: rest.latitude || null,
        longitude: rest.longitude || null,
        customerObjectives: rest.customerObjectives,
        propertyType: rest.propertyType,
        floors: rest.floors,
        installationType: rest.installationType,
        internetFiber: rest.internetFiber,
        internetRouter: rest.internetRouter,
        internetWifiGood: rest.internetWifiGood,
        internetNeedsRepeater: rest.internetNeedsRepeater,
        electricNearbyOutlet: rest.electricNearbyOutlet,
        electricNeedsPoint: rest.electricNeedsPoint,
        electricNeedsConduit: rest.electricNeedsConduit,
        distanceNvrRouter: rest.distanceNvrRouter || null,
        distanceCamera1: rest.distanceCamera1 || null,
        distanceCamera2: rest.distanceCamera2 || null,
        distanceCamera3: rest.distanceCamera3 || null,
        distanceCamera4: rest.distanceCamera4 || null,
        distanceTotalCable: rest.distanceTotalCable || null,
        recordingType: rest.recordingType,
        recordingDiskSize: rest.recordingDiskSize || null,
        remoteAccessPlatforms: rest.remoteAccessPlatforms,
        remoteAccessUsers: rest.remoteAccessUsers || null,
        additionalEquipment: rest.additionalEquipment,
        additionalEquipmentNotes: rest.additionalEquipmentNotes || null,
        crossSellItems: rest.crossSellItems,
        risksDetected: rest.risksDetected,
        observations: rest.observations || null,
        recommendedSystem: rest.recommendedSystem || null,
        estimatedInstallTime: rest.estimatedInstallTime || null,
        cameras: {
          create: cameras.map((cam) => ({
            position: cam.position,
            notes: cam.notes || null,
          })),
        },
        photos: {
          create: photos.map((pic) => ({
            url: pic.url,
            category: pic.category,
            caption: pic.caption || null,
          })),
        },
        signature: signature ? {
          create: {
            dataUrl: signature,
          }
        } : undefined,
      },
    })

    if (rest.visitId) {
      const visitStatus = rest.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'
      await prisma.scheduleVisit.update({
        where: { id: rest.visitId },
        data: { status: visitStatus },
      })
    }

    return inspection
  }

  /**
   * Actualiza un levantamiento técnico existente.
   */
  static async updateInspection(id: string, data: InspectionFormData) {
    const { cameras, photos, signature, ...rest } = data

    await prisma.$transaction([
      prisma.cameraRequirement.deleteMany({
        where: { inspectionId: id },
      }),
      prisma.uploadedPhoto.deleteMany({
        where: { inspectionId: id },
      }),
      prisma.inspection.update({
        where: { id },
        data: {
          status: rest.status,
          visitDate: rest.visitDate,
          latitude: rest.latitude || null,
          longitude: rest.longitude || null,
          customerObjectives: rest.customerObjectives,
          propertyType: rest.propertyType,
          floors: rest.floors,
          installationType: rest.installationType,
          internetFiber: rest.internetFiber,
          internetRouter: rest.internetRouter,
          internetWifiGood: rest.internetWifiGood,
          internetNeedsRepeater: rest.internetNeedsRepeater,
          electricNearbyOutlet: rest.electricNearbyOutlet,
          electricNeedsPoint: rest.electricNeedsPoint,
          electricNeedsConduit: rest.electricNeedsConduit,
          distanceNvrRouter: rest.distanceNvrRouter || null,
          distanceCamera1: rest.distanceCamera1 || null,
          distanceCamera2: rest.distanceCamera2 || null,
          distanceCamera3: rest.distanceCamera3 || null,
          distanceCamera4: rest.distanceCamera4 || null,
          distanceTotalCable: rest.distanceTotalCable || null,
          recordingType: rest.recordingType,
          recordingDiskSize: rest.recordingDiskSize || null,
          remoteAccessPlatforms: rest.remoteAccessPlatforms,
          remoteAccessUsers: rest.remoteAccessUsers || null,
          additionalEquipment: rest.additionalEquipment,
          additionalEquipmentNotes: rest.additionalEquipmentNotes || null,
          crossSellItems: rest.crossSellItems,
          risksDetected: rest.risksDetected,
          observations: rest.observations || null,
          recommendedSystem: rest.recommendedSystem || null,
          estimatedInstallTime: rest.estimatedInstallTime || null,
          cameras: {
            create: cameras.map((cam) => ({
              position: cam.position,
              notes: cam.notes || null,
            })),
          },
          photos: {
            create: photos.map((pic) => ({
              url: pic.url,
              category: pic.category,
              caption: pic.caption || null,
            })),
          },
          ...(signature ? {
            signature: {
              deleteMany: {},
              create: {
                dataUrl: signature,
              }
            }
          } : {})
        },
      }),
    ])

    const updatedInspection = await prisma.inspection.findUnique({
      where: { id },
      select: { visitId: true },
    })

    if (updatedInspection?.visitId) {
      const visitStatus = rest.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'
      await prisma.scheduleVisit.update({
        where: { id: updatedInspection.visitId },
        data: { status: visitStatus },
      })
    }
  }
}
