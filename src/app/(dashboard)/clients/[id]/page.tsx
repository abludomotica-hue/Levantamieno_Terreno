import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Plus, 
  ClipboardCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Edit2
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      inspections: {
        orderBy: { visitDate: 'desc' },
        include: {
          quote: { select: { totalAmount: true } }
        }
      }
    }
  })

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumbs / Back button */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/clients"
          className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Clientes</span>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider truncate max-w-[180px]">
          {client.name}
        </span>
      </div>

      {/* Grid Layout: Client Card + Inspections List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Client Info Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs h-fit space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex h-12 w-12 rounded-xl bg-blue-50 dark:bg-neutral-800 text-blue-600 dark:text-blue-400 items-center justify-center font-bold text-lg">
              {client.name.charAt(0)}
            </div>
            <Link
              href={`/clients/${client.id}/edit`}
              className="p-2 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors"
            >
              <Edit2 className="h-4.5 w-4.5" />
            </Link>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">{client.name}</h2>
            <p className="text-xs text-neutral-400">Cliente desde: {formatDate(client.createdAt)}</p>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4.5 w-4.5 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Dirección</p>
                <p className="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200">{client.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="h-4.5 w-4.5 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Teléfono</p>
                <p className="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200">{client.phone}</p>
              </div>
            </div>

            {client.email && (
              <div className="flex items-start gap-2.5">
                <Mail className="h-4.5 w-4.5 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Correo</p>
                  <p className="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200 truncate">{client.email}</p>
                </div>
              </div>
            )}

            {client.notes && (
              <div className="flex items-start gap-2.5">
                <FileText className="h-4.5 w-4.5 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Notas Internas</p>
                  <p className="mt-0.5 text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">
                    {client.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inspections History */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight text-neutral-900 dark:text-white">
                <ClipboardCheck className="h-5.5 w-5.5 text-blue-600" />
                Historial de Inspecciones
              </h3>
              <p className="text-xs text-neutral-400 mt-1">Levantamientos técnicos en terreno realizados para este cliente.</p>
            </div>
            <Link
              href={`/inspections/new?clientId=${client.id}`}
              className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/10 active:scale-98 transition-all duration-200 shrink-0"
            >
              <Plus className="h-4.5 w-4.5" />
              Nueva Inspección
            </Link>
          </div>

          {client.inspections.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20">
              <ClipboardCheck className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No hay inspecciones para este cliente</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                Inicie el levantamiento técnico en terreno para registrar cámaras, infraestructura y requerimientos.
              </p>
              <Link
                href={`/inspections/new?clientId=${client.id}`}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-505 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
              >
                Crear Inspección
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {client.inspections.map((insp) => (
                <div 
                  key={insp.id} 
                  className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                        Inspección {formatDate(insp.visitDate)}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        insp.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                          : insp.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/20'
                      }`}>
                        {insp.status === 'COMPLETED' ? 'Completada' : insp.status === 'IN_PROGRESS' ? 'En Progreso' : 'Borrador'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Visita: {formatDate(insp.visitDate)}
                      </span>
                      {insp.recommendedSystem && (
                        <span>• Sistema: {insp.recommendedSystem}</span>
                      )}
                      {insp.quote && (
                        <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
                          • 💰 Cotizado: ${Math.round(insp.quote.totalAmount * 1.19).toLocaleString('es-CL')} c/IVA
                        </span>
                      )}
                    </div>
                  </div>


                  <Link
                    href={`/inspections/${insp.id}`}
                    className="flex items-center justify-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800/50 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200"
                  >
                    Ver Detalles
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
