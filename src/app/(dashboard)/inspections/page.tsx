import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Search, Calendar, MapPin, User, ChevronRight, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function InspectionsPage(props: {
  searchParams: Promise<{ query?: string; status?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams.query || ''
  const statusFilter = searchParams.status || ''

  const inspections = await prisma.inspection.findMany({
    where: {
      AND: [
        statusFilter ? { status: statusFilter } : {},
        query
          ? {
              client: {
                OR: [
                  { name: { contains: query } },
                  { address: { contains: query } },
                ],
              },
            }
          : {},
      ],
    },
    include: {
      client: true,
      technician: true,
    },
    orderBy: {
      visitDate: 'desc',
    },
  })

  // Status Filter options
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'IN_PROGRESS', label: 'En Progreso' },
    { value: 'COMPLETED', label: 'Completada' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Inspecciones</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Realice el seguimiento, cree y actualice los levantamientos técnicos en terreno.
          </p>
        </div>
        <Link
          href="/inspections/new"
          className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-505 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/10 active:scale-98 transition-all duration-200"
        >
          <Plus className="h-4.5 w-4.5" />
          Nueva Inspección
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4">
        {/* Search */}
        <form method="GET" action="/inspections" className="relative flex items-center flex-1">
          <Search className="absolute left-4.5 h-5 w-5 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Buscar por cliente o dirección..."
            className="w-full pl-12 pr-4.5 py-2.5 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
          />
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        </form>

        {/* Status Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.value
            const url = new URL('http://localhost/inspections') // Placeholder to manipulate params
            if (query) url.searchParams.set('query', query)
            if (opt.value) url.searchParams.set('status', opt.value)
            const href = `/inspections${url.search}`

            return (
              <Link
                key={opt.value}
                href={href}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:bg-neutral-800/80'
                }`}
              >
                {opt.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Inspections List */}
      {inspections.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/50">
          <Calendar className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">No se encontraron inspecciones</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
            {query || statusFilter
              ? 'Intente ajustar los filtros de búsqueda.'
              : 'Comience registrando un levantamiento técnico para sus clientes.'}
          </p>
          {(query || statusFilter) && (
            <Link
              href="/inspections"
              className="mt-4 inline-flex px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Limpiar filtros
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {inspections.map((insp) => (
              <div 
                key={insp.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20 transition-all duration-200 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-base text-neutral-900 dark:text-white leading-snug">
                      {insp.client.name}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      insp.status === 'COMPLETED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/10'
                        : insp.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/10'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {insp.status === 'COMPLETED' ? 'Completada' : insp.status === 'IN_PROGRESS' ? 'En Progreso' : 'Borrador'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{insp.client.address}</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      Visita: {formatDate(insp.visitDate)}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      Técnico: {insp.technician.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end self-start sm:self-center shrink-0">
                  <Link
                    href={`/inspections/${insp.id}`}
                    className="flex items-center justify-center gap-1 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-all duration-200 shadow-xs"
                  >
                    Ver Detalles
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
