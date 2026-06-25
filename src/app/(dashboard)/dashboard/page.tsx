import prisma from '@/lib/prisma'
import Link from 'next/link'
import { 
  Users, 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Fetch statistics
  const [
    totalClients,
    totalInspections,
    completedInspections,
    pendingInspections,
    recentInspections,
    recentClients
  ] = await Promise.all([
    prisma.client.count(),
    prisma.inspection.count(),
    prisma.inspection.count({ where: { status: 'COMPLETED' } }),
    prisma.inspection.count({ where: { status: { in: ['DRAFT', 'IN_PROGRESS'] } } }),
    prisma.inspection.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: { client: true, technician: true }
    }),
    prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ])

  // Metric Cards Config
  const stats = [
    {
      label: 'Clientes Registrados',
      value: totalClients,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400',
    },
    {
      label: 'Total Inspecciones',
      value: totalInspections,
      icon: ClipboardCheck,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400',
    },
    {
      label: 'Visitas Completadas',
      value: completedInspections,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400',
    },
    {
      label: 'Levantamientos Pendientes',
      value: pendingInspections,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-neutral-900 dark:to-neutral-900/60 p-6 md:p-8 rounded-2xl border border-blue-600/20 dark:border-neutral-800 shadow-xl shadow-blue-900/5 dark:shadow-none text-white">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            ¡Bienvenido a Ablu Tech!
          </h1>
          <p className="mt-1.5 text-blue-100 dark:text-neutral-400 text-sm md:text-base max-w-xl">
            Plataforma centralizada para levantamientos técnicos e inspecciones de seguridad en terreno.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link
            href="/clients"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4.5 py-2.5 bg-white/10 hover:bg-white/18 border border-white/15 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <Plus className="h-4.5 w-4.5" />
            Nuevo Cliente
          </Link>
          <Link
            href="/inspections"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4.5 py-2.5 bg-white text-blue-900 hover:bg-neutral-100 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition-all duration-200"
          >
            <ClipboardCheck className="h-4.5 w-4.5" />
            Nueva Inspección
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div 
              key={i} 
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex items-center gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 shadow-xs"
            >
              <div className={`p-3 rounded-xl ${stat.color} shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold mt-1 tracking-tight text-neutral-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Inspections & Clients Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspections (Col span 2) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 lg:col-span-2 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              Inspecciones Recientes
            </h2>
            <Link 
              href="/inspections" 
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              Ver todas
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentInspections.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20">
              <ClipboardCheck className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No hay inspecciones registradas aún.</p>
              <Link
                href="/inspections"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2 hover:underline"
              >
                Crear la primera inspección
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {recentInspections.map((insp) => (
                <div key={insp.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-1">
                    <p className="font-bold text-neutral-800 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Link href={`/inspections/${insp.id}`}>{insp.client.name}</Link>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {insp.client.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {formatDate(insp.visitDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5 shrink-0" />
                        {insp.technician.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center self-start sm:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      insp.status === 'COMPLETED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                        : insp.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {insp.status === 'COMPLETED' ? 'Completada' : insp.status === 'IN_PROGRESS' ? 'En Progreso' : 'Borrador'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
              <Users className="h-5 w-5 text-blue-600" />
              Últimos Clientes
            </h2>
            <Link 
              href="/clients" 
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              Ver todos
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20">
              <Users className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No hay clientes registrados aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/40 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800/80 transition-all duration-200">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-neutral-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-neutral-800 dark:text-neutral-100">
                      <Link href={`/clients/${client.id}`}>{client.name}</Link>
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {client.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
