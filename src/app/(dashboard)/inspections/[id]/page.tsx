import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PrintButton from './print-button'
import { 
  ArrowLeft, 
  Edit2, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  Wifi, 
  ShieldAlert, 
  HardDrive, 
  Smartphone, 
  HardHat, 
  ChevronRight,
  Sparkles,
  Info,
  Video,
  Calculator
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { 
  CUSTOMER_OBJECTIVES, 
  CAMERA_POSITIONS, 
  RECORDING_TYPES, 
  REMOTE_PLATFORMS, 
  ADDITIONAL_EQUIPMENT, 
  CROSS_SELL_ITEMS, 
  RISKS 
} from '@/constants'

export const dynamic = 'force-dynamic'

function parseJsonArray(str: string | null | undefined): string[] {
  if (!str) return []
  try {
    return JSON.parse(str)
  } catch {
    return []
  }
}

export default async function InspectionDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      client: true,
      technician: true,
      cameras: true,
      signature: true,
      photos: true,
      quote: {
        include: {
          items: true
        }
      }
    }
  })

  if (!inspection) {
    notFound()
  }

  // Parse JSON arrays
  const objectives = parseJsonArray(inspection.customerObjectives)
  const recordingTypes = parseJsonArray(inspection.recordingType)
  const remotePlatforms = parseJsonArray(inspection.remoteAccessPlatforms)
  const equipment = parseJsonArray(inspection.additionalEquipment)
  const crossSell = parseJsonArray(inspection.crossSellItems)
  const risks = parseJsonArray(inspection.risksDetected)

  // Map IDs to labels
  const getLabels = (ids: string[], sourceList: readonly { id: string; label: string }[]) => {
    return ids.map(id => sourceList.find(item => item.id === id)?.label || id)
  }

  const objectiveLabels = getLabels(objectives, CUSTOMER_OBJECTIVES)
  const recordingLabels = getLabels(recordingTypes, RECORDING_TYPES)
  const remoteLabels = getLabels(remotePlatforms, REMOTE_PLATFORMS)
  const equipmentLabels = getLabels(equipment, ADDITIONAL_EQUIPMENT)
  const crossSellLabels = getLabels(crossSell, CROSS_SELL_ITEMS)
  const riskLabels = getLabels(risks, RISKS)

  return (
    <div className="space-y-6 animate-fade-in print:bg-white print:p-0">
      
      {/* Top action bar - Hidden on print */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2.5">
          <Link
            href="/inspections"
            className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Inspecciones</span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider">Detalles</span>
        </div>
        
        <div className="flex gap-2">
          {/* Print button */}
          <PrintButton />
          
          {/* Edit button */}
          <Link
            href={`/inspections/${inspection.id}/edit`}
            className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-505 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/10 active:scale-98 transition-all duration-200"
          >
            <Edit2 className="h-4 w-4" />
            Editar Levantamiento
          </Link>
        </div>
      </div>

      {/* Header Print View Only */}
      <div className="hidden print:flex flex-col border-b-2 border-neutral-800 pb-5 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase text-neutral-950">Ablu Tech</h1>
            <p className="text-xs text-neutral-500 font-semibold tracking-wider uppercase mt-0.5">Levantamiento Técnico de Terreno</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-neutral-600">ID Inspección: {inspection.id.slice(0, 8)}</p>
            <p className="text-xs text-neutral-500 mt-0.5">Fecha: {formatDate(inspection.visitDate)}</p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Client & technician summary */}
        <div className="space-y-6">
          
          {/* Status and Visit dates */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-450">Estado e Información</h3>
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-850 pb-3">
              <span className="text-sm font-semibold text-neutral-500">Estado</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                inspection.status === 'COMPLETED'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
              }`}>
                {inspection.status === 'COMPLETED' ? 'Completada' : 'Borrador'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-neutral-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Fecha de Visita</p>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                  {formatDate(inspection.visitDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-850">
              <User className="h-5 w-5 text-neutral-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Técnico Responsable</p>
                <p className="text-sm font-bold text-neutral-850 dark:text-neutral-200 mt-0.5">
                  {inspection.technician.name}
                </p>
              </div>
            </div>
          </div>

          {/* Presupuesto Comercial */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4 print:hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-450 flex items-center gap-1.5">
              <Calculator className="h-4.5 w-4.5 text-indigo-650" />
              Presupuesto Comercial
            </h3>
            {inspection.quote ? (
              <div className="space-y-3.5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">Monto Neto:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-250">${inspection.quote.totalAmount.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">IVA (19%):</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-250">${Math.round(inspection.quote.totalAmount * 0.19).toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold border-t border-neutral-100 dark:border-neutral-800 pt-2 text-indigo-650">
                    <span>Total Final:</span>
                    <span>${Math.round(inspection.quote.totalAmount * 1.19).toLocaleString('es-CL')}</span>
                  </div>
                </div>
                <Link
                  href={`/inspections/${inspection.id}/quote`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 hover:bg-neutral-950 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                >
                  Ver Presupuesto Comercial
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  No se ha generado un presupuesto comercial para este levantamiento técnico.
                </p>
                <Link
                  href={`/inspections/${inspection.id}/quote`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shadow-indigo-600/10 text-center"
                >
                  Generar Presupuesto Comercial
                </Link>
              </div>
            )}
          </div>

          {/* Client Details */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-450">Ficha del Cliente</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Cliente</p>
                <p className="mt-0.5 font-bold text-neutral-800 dark:text-neutral-100 leading-snug">{inspection.client.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Dirección</p>
                <p className="mt-0.5 font-medium text-neutral-700 dark:text-neutral-350 flex items-start gap-1">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-neutral-400" />
                  {inspection.client.address}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Teléfono</p>
                  <p className="mt-0.5 font-medium text-neutral-750 dark:text-neutral-300">{inspection.client.phone}</p>
                </div>
                {inspection.client.email && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Correo</p>
                    <p className="mt-0.5 font-medium text-neutral-750 dark:text-neutral-300 truncate">{inspection.client.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Full Technical details (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Property & Objectives */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-neutral-850 dark:text-white border-b border-neutral-100 dark:border-neutral-850 pb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Detalles de la Propiedad y Objetivos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tipo de Propiedad</p>
                <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200 capitalize">
                  {inspection.propertyType === 'comercial' ? 'Local comercial' : inspection.propertyType}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Número de Pisos</p>
                <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">{inspection.floors}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Instalación Recomendada</p>
                <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200 capitalize">{inspection.installationType}</p>
              </div>
            </div>
            {objectiveLabels.length > 0 && (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Objetivos de Seguridad del Cliente</p>
                <div className="flex flex-wrap gap-1.5">
                  {objectiveLabels.map((lbl, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-semibold">
                      {lbl}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Network & Electrical */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-neutral-850 dark:text-white border-b border-neutral-100 dark:border-neutral-850 pb-3 flex items-center gap-2">
              <Wifi className="h-5 w-5 text-blue-600" />
              Factibilidad Técnica: Red e Instalación Eléctrica
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Internet */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Conectividad de Internet</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs p-2.5 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-850 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400">¿Posee Fibra Óptica?</span>
                    <span className={`font-bold ${inspection.internetFiber ? 'text-emerald-600' : 'text-red-500'}`}>{inspection.internetFiber ? 'Sí' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-850 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400">¿Router Accesible?</span>
                    <span className={`font-bold ${inspection.internetRouter ? 'text-emerald-600' : 'text-red-500'}`}>{inspection.internetRouter ? 'Sí' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-850 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400">¿Wi-Fi con buena señal?</span>
                    <span className={`font-bold ${inspection.internetWifiGood ? 'text-emerald-600' : 'text-red-500'}`}>{inspection.internetWifiGood ? 'Sí' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-850 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400">¿Requiere repetidor?</span>
                    <span className={`font-bold ${inspection.internetNeedsRepeater ? 'text-amber-500' : 'text-neutral-500'}`}>{inspection.internetNeedsRepeater ? 'Sí' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Electrical */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Puntos de Alimentación</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs p-2.5 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-850 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400">¿Tomacorriente cercano?</span>
                    <span className={`font-bold ${inspection.electricNearbyOutlet ? 'text-emerald-600' : 'text-red-500'}`}>{inspection.electricNearbyOutlet ? 'Sí' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-850 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400">¿Requiere punto nuevo?</span>
                    <span className={`font-bold ${inspection.electricNeedsPoint ? 'text-amber-500' : 'text-neutral-500'}`}>{inspection.electricNeedsPoint ? 'Sí' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-850 rounded-xl">
                    <span className="text-neutral-600 dark:text-neutral-400">¿Requiere canalización?</span>
                    <span className={`font-bold ${inspection.electricNeedsConduit ? 'text-amber-500' : 'text-neutral-500'}`}>{inspection.electricNeedsConduit ? 'Sí' : 'No'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Cameras list & cabling */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-neutral-850 dark:text-white border-b border-neutral-100 dark:border-neutral-850 pb-3 flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              Requerimientos de Cámaras y Cableado
            </h2>
            
            {inspection.cameras.length === 0 ? (
              <p className="text-xs text-neutral-550 dark:text-neutral-400 italic">No se indicaron cámaras específicas.</p>
            ) : (
              <div className="space-y-3">
                {inspection.cameras.map((cam, idx) => (
                  <div key={cam.id} className="p-3 border border-neutral-150 dark:border-neutral-850 rounded-xl bg-neutral-50/30 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-neutral-850 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 capitalize">
                        {CAMERA_POSITIONS.find(c => c.id === cam.position)?.label || cam.position}
                      </p>
                      {cam.notes && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{cam.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-4 border-t border-neutral-100 dark:border-neutral-850">
              {inspection.distanceNvrRouter && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Distancia NVR - Router</p>
                  <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">{inspection.distanceNvrRouter} m</p>
                </div>
              )}
              {inspection.distanceTotalCable && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Metraje UTP Estimado</p>
                  <p className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">{inspection.distanceTotalCable} m</p>
                </div>
              )}
            </div>
          </div>

          {/* Recording & Remote access */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-neutral-850 dark:text-white border-b border-neutral-100 dark:border-neutral-850 pb-3 flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              Equipos de Grabación y Acceso
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Recording */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sistema de Grabación</p>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-neutral-750 dark:text-neutral-300">
                    Tipo(s): {recordingLabels.length > 0 ? recordingLabels.join(', ') : 'Ninguno'}
                  </div>
                  {inspection.recordingDiskSize && (
                    <div className="text-xs text-neutral-500">Disco: {inspection.recordingDiskSize.toUpperCase()}</div>
                  )}
                </div>
              </div>

              {/* Remote access */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Acceso Remoto</p>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-neutral-750 dark:text-neutral-300">
                    Plataformas: {remoteLabels.length > 0 ? remoteLabels.join(', ') : 'Ninguna'}
                  </div>
                  {inspection.remoteAccessUsers && (
                    <div className="text-xs text-neutral-500">Usuarios: {inspection.remoteAccessUsers}</div>
                  )}
                </div>
              </div>

            </div>

            {/* Additional equipment */}
            {equipmentLabels.length > 0 && (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Accesorios Adicionales Requeridos</p>
                <div className="flex flex-wrap gap-1.5">
                  {equipmentLabels.map((lbl, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 text-neutral-750 dark:text-neutral-300 rounded-lg text-xs font-semibold">
                      {lbl}
                    </span>
                  ))}
                </div>
                {inspection.additionalEquipmentNotes && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-2.5 bg-neutral-50/50 dark:bg-neutral-950/20 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-850">
                    {inspection.additionalEquipmentNotes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Proposal, observations, risks */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-neutral-850 dark:text-white border-b border-neutral-100 dark:border-neutral-850 pb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Propuesta Comercial e Identificación de Riesgos
            </h2>

            {riskLabels.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 mb-2">Riesgos Identificados</p>
                <div className="flex flex-wrap gap-1.5">
                  {riskLabels.map((lbl, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg text-xs font-semibold border border-red-100/10">
                      {lbl}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {crossSellLabels.length > 0 && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 mb-2">Oportunidades Smart Home</p>
                <div className="flex flex-wrap gap-1.5">
                  {crossSellLabels.map((lbl, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50/30 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold">
                      {lbl}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {inspection.recommendedSystem && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sistema Recomendado</p>
                  <p className="mt-1 font-bold text-sm text-neutral-800 dark:text-neutral-100">{inspection.recommendedSystem}</p>
                </div>
              )}
              {inspection.estimatedInstallTime && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tiempo de Ejecución Estimado</p>
                  <p className="mt-1 font-bold text-sm text-neutral-800 dark:text-neutral-100">{inspection.estimatedInstallTime}</p>
                </div>
              )}
            </div>

            {inspection.observations && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Observaciones Finales</p>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-450 whitespace-pre-wrap leading-relaxed">
                  {inspection.observations}
                </p>
              </div>
            )}
          </div>

          {/* Galería de Evidencia Fotográfica */}
          {inspection.photos && inspection.photos.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4 print:break-inside-avoid">
              <h2 className="text-base font-bold text-neutral-850 dark:text-white border-b border-neutral-100 dark:border-neutral-850 pb-3 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                Evidencia Fotográfica de Terreno
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
                {inspection.photos.map((pic) => (
                  <div 
                    key={pic.id} 
                    className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/20 dark:bg-neutral-950/15 flex flex-col justify-between"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-neutral-100 border-b border-neutral-200 dark:border-neutral-800 relative">
                      <img 
                        src={pic.url} 
                        alt={pic.caption || pic.category || 'Foto'} 
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/25 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded">
                        {pic.category === 'fachada' ? 'Fachada / Exterior' : 
                         pic.category === 'camara' ? 'Ubicación Cámara' : 
                         pic.category === 'punto_red' ? 'Punto de Red' : 
                         pic.category === 'punto_electrico' ? 'Alimentación Eléctrica' : 
                         pic.category === 'obstaculo' ? 'Obstáculo' : pic.category || 'Foto'}
                      </span>
                      {pic.caption && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 pl-1 line-clamp-2">
                          {pic.caption}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature Preview */}
          {inspection.signature && inspection.signature.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-neutral-850 dark:text-white border-b border-neutral-100 dark:border-neutral-850 pb-3">
                Firmas y Aceptación
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white p-4 max-w-[280px]">
                  <img 
                    src={inspection.signature[0].dataUrl} 
                    alt="Firma del cliente" 
                    className="max-h-[100px] object-contain bg-white" 
                  />
                  <div className="border-t border-neutral-200 mt-2 pt-1 text-center">
                    <p className="text-[10px] font-bold uppercase text-neutral-450">Firma del Cliente</p>
                  </div>
                </div>
                <div className="text-xs text-neutral-500 space-y-1 text-center sm:text-left">
                  <p className="font-bold text-neutral-750 dark:text-neutral-350">Aceptación de Visita Técnica:</p>
                  <p>Nombre del firmante: {inspection.signature[0].signerName || inspection.client.name}</p>
                  <p>Fecha de firma: {formatDate(inspection.signature[0].createdAt)}</p>
                  <p className="text-[10px] text-neutral-400 mt-2">
                    Esta firma certifica que el cliente está conforme con los puntos recomendados y viabilidades descritas.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
