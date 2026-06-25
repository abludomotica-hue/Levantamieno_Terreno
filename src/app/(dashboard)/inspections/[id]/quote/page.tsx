import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getPreloadedItemsFromInspection } from '@/app/actions/quotes'
import QuoteClient from '@/components/quote/QuoteClient'

export const dynamic = 'force-dynamic'

interface QuotePageProps {
  params: Promise<{ id: string }>
}

export default async function InspectionQuotePage(props: QuotePageProps) {
  const { id } = await props.params

  // 1. Fetch inspection details
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      client: true,
      technician: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!inspection) {
    notFound()
  }

  // 2. Fetch all products from catalog
  const catalogProducts = await prisma.product.findMany({
    orderBy: { name: 'asc' }
  })

  // 3. Fetch existing quote if saved
  const existingQuote = await prisma.quote.findUnique({
    where: { inspectionId: id },
    include: {
      items: {
        orderBy: { name: 'asc' }
      }
    }
  })

  // 4. Get preloaded items suggested by the technical checklist
  let preloadedItems: Array<{ name: string; price: number; quantity: number }> = []
  try {
    preloadedItems = await getPreloadedItemsFromInspection(id)
  } catch (error) {
    console.error('Error preloading quote items:', error)
  }

  // Convert DB objects to match client component prop expectations
  const serializedInspection = {
    id: inspection.id,
    visitDate: inspection.visitDate.toISOString(),
    client: {
      name: inspection.client.name,
      address: inspection.client.address,
      phone: inspection.client.phone,
      email: inspection.client.email
    },
    technician: {
      name: inspection.technician.name,
      email: inspection.technician.email
    },
    recommendedSystem: inspection.recommendedSystem,
    estimatedInstallTime: inspection.estimatedInstallTime,
    observations: inspection.observations
  }

  const serializedCatalogProducts = catalogProducts.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description
  }))

  const serializedExistingQuote = existingQuote ? {
    id: existingQuote.id,
    notes: existingQuote.notes,
    totalAmount: existingQuote.totalAmount,
    items: existingQuote.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.total
    }))
  } : null

  return (
    <div className="space-y-6">
      <QuoteClient
        inspectionId={id}
        inspection={serializedInspection}
        catalogProducts={serializedCatalogProducts}
        existingQuote={serializedExistingQuote}
        preloadedItems={preloadedItems}
      />
    </div>
  )
}
