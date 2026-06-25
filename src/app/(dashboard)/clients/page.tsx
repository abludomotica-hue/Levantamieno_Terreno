import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Search, MapPin, Phone, Mail, FileText, ChevronRight, Clipboard } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientsPage(props: {
  searchParams: Promise<{ query?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams.query || ''

  const clients = await prisma.client.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query } },
            { address: { contains: query } },
            { phone: { contains: query } },
            { email: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { inspections: true }
      }
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Clientes</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Administre la cartera de clientes y acceda a sus levantamientos técnicos.
          </p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/10 active:scale-98 transition-all duration-200"
        >
          <Plus className="h-4.5 w-4.5" />
          Registrar Cliente
        </Link>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
        <form method="GET" action="/clients" className="relative flex items-center w-full">
          <Search className="absolute left-4.5 h-5 w-5 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Buscar por nombre, dirección, teléfono o email..."
            className="w-full pl-12 pr-4.5 py-3 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
          />
        </form>
      </div>

      {/* Clients List/Grid */}
      {clients.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/50">
          <Search className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">No se encontraron clientes</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
            {query 
              ? 'Intente buscar con otros términos o limpie el filtro de búsqueda.' 
              : 'Comience registrando un nuevo cliente en la plataforma.'}
          </p>
          {query && (
            <Link
              href="/clients"
              className="mt-4 inline-flex px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Limpiar búsqueda
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((client) => (
            <div 
              key={client.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md hover:shadow-black/2 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header card */}
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-white leading-tight">
                      {client.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/35 dark:border-blue-900/30">
                      <Clipboard className="h-3 w-3" />
                      {client._count.inspections} {client._count.inspections === 1 ? 'Inspección' : 'Inspecciones'}
                    </span>
                  </div>
                  <Link
                    href={`/clients/${client.id}`}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span>{client.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span>{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex justify-end gap-3.5">
                <Link
                  href={`/clients/${client.id}`}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  Ver Ficha
                </Link>
                <Link
                  href={`/inspections/new?clientId=${client.id}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Crear Inspección
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
