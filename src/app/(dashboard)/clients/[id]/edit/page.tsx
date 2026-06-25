import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditClientForm from './edit-client-form'

export const dynamic = 'force-dynamic'

export default async function EditClientPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const client = await prisma.client.findUnique({
    where: { id },
  })

  if (!client) {
    notFound()
  }

  // Serialize dates to prevent Next.js Client Component serialization errors
  const serializedClient = {
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }

  return <EditClientForm client={serializedClient as any} />
}
