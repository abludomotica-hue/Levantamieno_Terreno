import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditInspectionForm from './edit-inspection-form'

export const dynamic = 'force-dynamic'

function parseJsonArray(str: string | null | undefined): string[] {
  if (!str) return []
  try {
    return JSON.parse(str)
  } catch {
    return []
  }
}

export default async function EditInspectionPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const [inspection, clients] = await Promise.all([
    prisma.inspection.findUnique({
      where: { id },
      include: { cameras: true },
    }),
    prisma.client.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  if (!inspection) {
    notFound()
  }

  // Parse JSON strings into arrays for react-hook-form
  const parsedInspection = {
    ...inspection,
    customerObjectives: parseJsonArray(inspection.customerObjectives),
    recordingType: parseJsonArray(inspection.recordingType),
    remoteAccessPlatforms: parseJsonArray(inspection.remoteAccessPlatforms),
    additionalEquipment: parseJsonArray(inspection.additionalEquipment),
    crossSellItems: parseJsonArray(inspection.crossSellItems),
    risksDetected: parseJsonArray(inspection.risksDetected),
  }

  return <EditInspectionForm inspection={parsedInspection as any} clients={clients} />
}
