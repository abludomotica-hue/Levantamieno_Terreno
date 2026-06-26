import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditInspectionForm from './edit-inspection-form'

export const dynamic = 'force-dynamic'

function parseJsonArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
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

  // Parse JSON strings into arrays for react-hook-form and serialize dates
  const parsedInspection = {
    ...inspection,
    visitDate: inspection.visitDate.toISOString(),
    createdAt: inspection.createdAt.toISOString(),
    updatedAt: inspection.updatedAt.toISOString(),
    customerObjectives: parseJsonArray(inspection.customerObjectives),
    recordingType: parseJsonArray(inspection.recordingType),
    remoteAccessPlatforms: parseJsonArray(inspection.remoteAccessPlatforms),
    additionalEquipment: parseJsonArray(inspection.additionalEquipment),
    crossSellItems: parseJsonArray(inspection.crossSellItems),
    risksDetected: parseJsonArray(inspection.risksDetected),
  }

  const serializedClients = clients.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return <EditInspectionForm inspection={parsedInspection as any} clients={serializedClients as any} />
}
