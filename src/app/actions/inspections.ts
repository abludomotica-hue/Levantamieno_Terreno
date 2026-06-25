'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { inspectionSchema, InspectionFormData } from '@/lib/validations/inspection'
import { revalidatePath } from 'next/cache'

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

  const { cameras, ...rest } = validated.data

  const inspection = await prisma.inspection.create({
    data: {
      clientId: rest.clientId,
      visitId: rest.visitId || null,
      technicianId: user.id,
      status: rest.status,
      visitDate: rest.visitDate,
      latitude: rest.latitude || null,
      longitude: rest.longitude || null,
      customerObjectives: JSON.stringify(rest.customerObjectives),
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
      recordingType: JSON.stringify(rest.recordingType),
      recordingDiskSize: rest.recordingDiskSize || null,
      remoteAccessPlatforms: JSON.stringify(rest.remoteAccessPlatforms),
      remoteAccessUsers: rest.remoteAccessUsers || null,
      additionalEquipment: JSON.stringify(rest.additionalEquipment),
      additionalEquipmentNotes: rest.additionalEquipmentNotes || null,
      crossSellItems: JSON.stringify(rest.crossSellItems),
      risksDetected: JSON.stringify(rest.risksDetected),
      observations: rest.observations || null,
      recommendedSystem: rest.recommendedSystem || null,
      estimatedInstallTime: rest.estimatedInstallTime || null,
      cameras: {
        create: cameras.map((cam) => ({
          position: cam.position,
          notes: cam.notes || null,
        })),
      },
    },
  })

  if (rest.visitId) {
    const visitStatus = rest.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'
    await prisma.scheduleVisit.update({
      where: { id: rest.visitId },
      data: { status: visitStatus },
    })
    revalidatePath('/schedule')
  }

  revalidatePath('/inspections')
  revalidatePath('/dashboard')
  revalidatePath(`/clients/${rest.clientId}`)

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

  const validated = inspectionSchema.safeParse(data)
  if (!validated.success) {
    console.error('Validation errors:', validated.error.flatten())
    throw new Error('Datos de inspección inválidos.')
  }

  const { cameras, ...rest } = validated.data

  await prisma.$transaction([
    prisma.cameraRequirement.deleteMany({
      where: { inspectionId: id },
    }),
    prisma.inspection.update({
      where: { id },
      data: {
        status: rest.status,
        visitDate: rest.visitDate,
        latitude: rest.latitude || null,
        longitude: rest.longitude || null,
        customerObjectives: JSON.stringify(rest.customerObjectives),
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
        recordingType: JSON.stringify(rest.recordingType),
        recordingDiskSize: rest.recordingDiskSize || null,
        remoteAccessPlatforms: JSON.stringify(rest.remoteAccessPlatforms),
        remoteAccessUsers: rest.remoteAccessUsers || null,
        additionalEquipment: JSON.stringify(rest.additionalEquipment),
        additionalEquipmentNotes: rest.additionalEquipmentNotes || null,
        crossSellItems: JSON.stringify(rest.crossSellItems),
        risksDetected: JSON.stringify(rest.risksDetected),
        observations: rest.observations || null,
        recommendedSystem: rest.recommendedSystem || null,
        estimatedInstallTime: rest.estimatedInstallTime || null,
        cameras: {
          create: cameras.map((cam) => ({
            position: cam.position,
            notes: cam.notes || null,
          })),
        },
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
    revalidatePath('/schedule')
  }

  revalidatePath('/inspections')
  revalidatePath(`/inspections/${id}`)
  revalidatePath('/dashboard')
  revalidatePath(`/clients/${rest.clientId}`)
}
