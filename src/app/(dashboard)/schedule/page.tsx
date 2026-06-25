import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar'
import { getVisits } from '@/app/actions/visits'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autorizado')
  }

  // Obtener los datos necesarios en paralelo
  const [clients, technicians, visits] = await Promise.all([
    prisma.client.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    getVisits(
      user.role === 'ADMIN' || user.role === 'SUPERVISOR'
        ? undefined
        : { technicianId: user.id }
    ),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Operaciones
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Agenda de Visitas Técnicas
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Planificación y asignación de levantamientos en terreno.
          </p>
        </div>
      </div>

      <ScheduleCalendar
        initialVisits={JSON.parse(JSON.stringify(visits))}
        clients={clients}
        technicians={technicians}
        currentUser={user}
      />
    </div>
  )
}
