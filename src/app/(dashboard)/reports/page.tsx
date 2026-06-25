import prisma from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Eye, Printer, User, MapPin, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  // Fetch completed inspections
  const completedInspections = await prisma.inspection.findMany({
    where: {
      status: 'COMPLETED',
    },
    include: {
      client: true,
      technician: true,
    },
    orderBy: {
      visitDate: 'desc',
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Informes Técnicos</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Acceda y exporte los informes técnicos de las visitas completadas y validadas por el cliente.
        </p>
      </div>

      {/* Reports Table/Grid */}
      {completedInspections.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/50">
          <FileText className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-200">No hay informes disponibles</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
            Los informes se generan automáticamente cuando un levantamiento técnico se marca como <strong>Completada</strong> en la plataforma.
          </p>
          <Link
            href="/inspections"
            className="mt-5 inline-flex px-4.5 py-2.5 bg-blue-600 hover:bg-blue-505 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            Ir a Inspecciones
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-450">Documentos Firmados</h2>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {completedInspections.map((insp) => (
              <div 
                key={insp.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20 transition-all duration-200"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                    <span className="font-bold text-base text-neutral-900 dark:text-white truncate leading-snug">
                      Informe Técnico - {insp.client.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{insp.client.address}</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      Fecha de Visita: {formatDate(insp.visitDate)}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      Responsable: {insp.technician.name}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/inspections/${insp.id}`}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-350 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Visualizar
                  </Link>
                  <Link
                    href={`/inspections/${insp.id}`}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold border border-blue-100/10 transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir
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
