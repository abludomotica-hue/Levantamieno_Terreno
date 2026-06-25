import prisma from '@/lib/prisma'
import NewInspectionForm from './new-inspection-form'

export const dynamic = 'force-dynamic'

export default async function NewInspectionPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
  })

  // Serialize dates to prevent Next.js Client Component serialization errors
  const serializedClients = clients.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return <NewInspectionForm clients={serializedClients as any} />
}
