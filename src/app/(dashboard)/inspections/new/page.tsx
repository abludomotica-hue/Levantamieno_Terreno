import prisma from '@/lib/prisma'
import NewInspectionForm from './new-inspection-form'

export const dynamic = 'force-dynamic'

export default async function NewInspectionPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: 'asc' },
  })

  return <NewInspectionForm clients={clients} />
}
