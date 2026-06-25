import { getCurrentUser } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'
import CatalogClient from '@/components/catalog/CatalogClient'

export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold text-neutral-450 dark:text-neutral-555 uppercase tracking-wider">
          Administración
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-0.5">
          Catálogo de Productos y Servicios
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Gestiona los dispositivos de seguridad, cableado y servicios de instalación para presupuestar levantamientos técnicos.
        </p>
      </div>

      <CatalogClient
        initialProducts={JSON.parse(JSON.stringify(products))}
        currentUser={user}
      />
    </div>
  )
}
