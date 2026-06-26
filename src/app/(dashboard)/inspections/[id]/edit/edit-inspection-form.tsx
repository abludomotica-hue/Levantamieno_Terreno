'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inspectionSchema, InspectionFormData } from '@/lib/validations/inspection'
import { updateInspection } from '@/app/actions/inspections'
import { toast } from 'sonner'
import { 
  ArrowLeft, ArrowRight, Save, Loader2, Plus, Trash2, MapPin, 
  Wifi, Shield, Activity, Video, HardDrive, Smartphone, HardHat, FileText, CheckCircle2 
} from 'lucide-react'
import Link from 'next/link'
import { Client, CameraRequirement } from '@prisma/client'
import { 
  CUSTOMER_OBJECTIVES, 
  PROPERTY_TYPES, 
  CAMERA_POSITIONS, 
  INSTALLATION_TYPES, 
  RECORDING_TYPES, 
  DISK_SIZES, 
  REMOTE_PLATFORMS, 
  ADDITIONAL_EQUIPMENT, 
  CROSS_SELL_ITEMS, 
  RISKS 
} from '@/constants'

interface EditInspectionFormProps {
  inspection: any
  clients: Client[]
}

const STEPS = [
  { title: 'General', icon: Shield },
  { title: 'Infraestructura', icon: Wifi },
  { title: 'Cámaras', icon: Video },
  { title: 'Equipamiento', icon: HardDrive },
  { title: 'Propuesta', icon: Activity },
  { title: 'Fotos', icon: Smartphone },
  { title: 'Cierre', icon: FileText }
]

export default function EditInspectionForm({ inspection, clients }: EditInspectionFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema) as any,
    defaultValues: {
      clientId: inspection.clientId,
      status: inspection.status,
      visitDate: new Date(inspection.visitDate),
      latitude: inspection.latitude,
      longitude: inspection.longitude,
      customerObjectives: inspection.customerObjectives || [],
      propertyType: inspection.propertyType || 'casa',
      floors: inspection.floors || 1,
      installationType: inspection.installationType || 'wifi',
      internetFiber: inspection.internetFiber || false,
      internetRouter: inspection.internetRouter || false,
      internetWifiGood: inspection.internetWifiGood || false,
      internetNeedsRepeater: inspection.internetNeedsRepeater || false,
      electricNearbyOutlet: inspection.electricNearbyOutlet || false,
      electricNeedsPoint: inspection.electricNeedsPoint || false,
      electricNeedsConduit: inspection.electricNeedsConduit || false,
      distanceNvrRouter: inspection.distanceNvrRouter,
      distanceCamera1: inspection.distanceCamera1,
      distanceCamera2: inspection.distanceCamera2,
      distanceCamera3: inspection.distanceCamera3,
      distanceCamera4: inspection.distanceCamera4,
      distanceTotalCable: inspection.distanceTotalCable,
      recordingType: inspection.recordingType || [],
      recordingDiskSize: inspection.recordingDiskSize || '1tb',
      remoteAccessPlatforms: inspection.remoteAccessPlatforms || [],
      remoteAccessUsers: inspection.remoteAccessUsers || 1,
      additionalEquipment: inspection.additionalEquipment || [],
      additionalEquipmentNotes: inspection.additionalEquipmentNotes || '',
      crossSellItems: inspection.crossSellItems || [],
      risksDetected: inspection.risksDetected || [],
      observations: inspection.observations || '',
      recommendedSystem: inspection.recommendedSystem || '',
      estimatedInstallTime: inspection.estimatedInstallTime || '',
      cameras: inspection.cameras.map((c: CameraRequirement) => ({
        position: c.position,
        notes: c.notes || '',
      })) || [],
      photos: inspection.photos?.map((p: any) => ({
        url: p.url,
        category: p.category || 'camara',
        caption: p.caption || '',
      })) || [],
    },
  })

  const { fields: cameraFields, append: appendCamera, remove: removeCamera } = useFieldArray({
    control,
    name: 'cameras',
  })

  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({
    control,
    name: 'photos',
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (photoFields.length + files.length > 10) {
      toast.error('Puedes subir un máximo de 10 fotos.')
      return
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          const MAX_WIDTH = 800
          const MAX_HEIGHT = 600

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
            appendPhoto({
              url: compressedBase64,
              category: 'camara',
              caption: ''
            })
          }
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // Watch fields for conditional logic
  const selectedClientId = watch('clientId')
  const clientInfo = clients.find(c => c.id === selectedClientId)
  const watchRecordingType = watch('recordingType')
  const watchObjectives = watch('customerObjectives')
  const watchPlatforms = watch('remoteAccessPlatforms')
  const watchEquipment = watch('additionalEquipment')
  const watchCrossSell = watch('crossSellItems')
  const watchRisks = watch('risksDetected')

  // GPS Coordinates Capture
  const [gpsLoading, setGpsLoading] = useState(false)
  const captureGPS = () => {
    setGpsLoading(true)
    if (!navigator.geolocation) {
      toast.error('La geolocalización no está soportada por su navegador.')
      setGpsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setValue('latitude', latitude)
        setValue('longitude', longitude)
        toast.success('Ubicación GPS actualizada')
        setGpsLoading(false)
      },
      (error) => {
        console.error(error)
        toast.error('No se pudo obtener la ubicación GPS.')
        setGpsLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }

  // Handle Multi-step transitions
  const handleNext = async () => {
    let fieldsToValidate: any[] = []
    if (currentStep === 0) {
      fieldsToValidate = ['clientId']
    } else if (currentStep === 1) {
      fieldsToValidate = ['propertyType', 'installationType']
    }

    const isValid = fieldsToValidate.length > 0 
      ? await trigger(fieldsToValidate as any) 
      : true

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    } else {
      toast.error('Por favor complete los campos requeridos.')
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // Submit Handler
  const onSubmit = async (data: InspectionFormData) => {
    try {
      await updateInspection(inspection.id, data)
      toast.success('Levantamiento técnico actualizado exitosamente')
      router.push(`/inspections/${inspection.id}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Ocurrió un error al actualizar la inspección.')
    }
  }

  const handleCheckboxChange = (field: 'customerObjectives' | 'recordingType' | 'remoteAccessPlatforms' | 'additionalEquipment' | 'crossSellItems' | 'risksDetected', value: string, checked: boolean) => {
    const currentValues = watch(field) as string[]
    if (checked) {
      setValue(field, [...currentValues, value] as any)
    } else {
      setValue(field, currentValues.filter(val => val !== value) as any)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs / Back button */}
      <div className="flex items-center gap-2.5">
        <Link
          href={`/inspections/${inspection.id}`}
          className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Inspecciones</span>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider truncate max-w-[150px]">
          {clientInfo?.name || 'Cliente'}
        </span>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider">Editar</span>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] px-2">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon
            const isCompleted = idx < currentStep
            const isActive = idx === currentStep
            return (
              <React.Fragment key={idx}>
                <button
                  type="button"
                  onClick={async () => {
                    if (idx < currentStep) {
                      setCurrentStep(idx)
                    } else if (idx > currentStep) {
                      handleNext()
                    }
                  }}
                  className="flex items-center gap-2 text-left focus:outline-none group shrink-0"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-accent text-white'
                      : isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-5.5 w-5.5" /> : <StepIcon className="h-4.5 w-4.5" />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-accent dark:text-accent' : 'text-neutral-400'
                    }`}>
                      Paso {idx + 1}
                    </p>
                    <p className={`text-xs font-semibold ${
                      isActive ? 'text-neutral-850 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`h-[2px] flex-1 mx-3 ${
                    idx < currentStep ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800'
                  }`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="p-6 md:p-8 space-y-8">
          
          {/* STEP 1: GENERAL INFO */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                1. Información del Cliente y Visita
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="clientId" className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Seleccionar Cliente *
                  </label>
                  <select
                    id="clientId"
                    {...register('clientId')}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="visitDate" className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Fecha de Visita Técnica
                  </label>
                  <input
                    id="visitDate"
                    type="date"
                    {...register('visitDate', { valueAsDate: true })}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>

              {clientInfo && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-200/60 dark:border-neutral-800/80 rounded-xl space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <p className="font-bold text-neutral-700 dark:text-neutral-350">Datos de Contacto:</p>
                  <p>📍 Dirección: {clientInfo.address}</p>
                  <p>📞 Teléfono: {clientInfo.phone}</p>
                  {clientInfo.email && <p>✉ Email: {clientInfo.email}</p>}
                </div>
              )}

              {/* GPS Coordinates Capture */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Ubicación Geográfica (GPS)
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={captureGPS}
                    disabled={gpsLoading}
                    className="flex items-center gap-2 px-4.5 py-2.5 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {gpsLoading ? (
                      <Loader2 className="animate-spin h-4.5 w-4.5 text-accent" />
                    ) : (
                      <MapPin className="h-4.5 w-4.5 text-accent" />
                    )}
                    Actualizar Ubicación GPS
                  </button>
                  {watch('latitude') && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-100/10 animate-fade-in">
                      Lat: {Number(watch('latitude')).toFixed(6)} | Lng: {Number(watch('longitude')).toFixed(6)}
                    </span>
                  )}
                </div>
              </div>

              {/* Objectives */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Objetivos del Cliente
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {CUSTOMER_OBJECTIVES.map((obj) => (
                    <label 
                      key={obj.id}
                      className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-950/25 ${
                        watchObjectives.includes(obj.id)
                          ? 'border-accent bg-accent-soft/20 dark:bg-accent-soft/5 text-accent dark:text-blue-400 font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={watchObjectives.includes(obj.id)}
                        onChange={(e) => handleCheckboxChange('customerObjectives', obj.id, e.target.checked)}
                        className="rounded border-neutral-300 text-accent focus:ring-accent h-4.5 w-4.5"
                      />
                      <span className="text-xs">{obj.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INFRASTRUCTURE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                2. Infraestructura y Red
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="propertyType" className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Tipo de Vivienda *
                  </label>
                  <select
                    id="propertyType"
                    {...register('propertyType')}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {PROPERTY_TYPES.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="floors" className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Número de Pisos
                  </label>
                  <select
                    id="floors"
                    {...register('floors', { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3 o más</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="installationType" className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Tipo de Instalación *
                  </label>
                  <select
                    id="installationType"
                    {...register('installationType')}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {INSTALLATION_TYPES.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Internet */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Conectividad de Internet</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50">
                    <span className="text-xs font-semibold text-neutral-705 dark:text-neutral-350">Posee Fibra Óptica</span>
                    <input type="checkbox" {...register('internetFiber')} className="rounded border-neutral-300 text-accent focus:ring-accent h-5 w-5" />
                  </label>
                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50">
                    <span className="text-xs font-semibold text-neutral-705 dark:text-neutral-350">Router es accesible</span>
                    <input type="checkbox" {...register('internetRouter')} className="rounded border-neutral-300 text-accent focus:ring-accent h-5 w-5" />
                  </label>
                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50">
                    <span className="text-xs font-semibold text-neutral-705 dark:text-neutral-350">Calidad de Wi-Fi aceptable</span>
                    <input type="checkbox" {...register('internetWifiGood')} className="rounded border-neutral-300 text-accent focus:ring-accent h-5 w-5" />
                  </label>
                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50">
                    <span className="text-xs font-semibold text-neutral-705 dark:text-neutral-350">Requiere repetidor de señal</span>
                    <input type="checkbox" {...register('internetNeedsRepeater')} className="rounded border-neutral-300 text-accent focus:ring-accent h-5 w-5" />
                  </label>
                </div>
              </div>

              {/* Electrical */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Puntos de Alimentación Eléctrica</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50">
                    <span className="text-xs font-semibold text-neutral-705 dark:text-neutral-350">Tomacorriente cercano</span>
                    <input type="checkbox" {...register('electricNearbyOutlet')} className="rounded border-neutral-300 text-accent focus:ring-accent h-5 w-5" />
                  </label>
                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50">
                    <span className="text-xs font-semibold text-neutral-705 dark:text-neutral-350">Requiere punto nuevo</span>
                    <input type="checkbox" {...register('electricNeedsPoint')} className="rounded border-neutral-300 text-accent focus:ring-accent h-5 w-5" />
                  </label>
                  <label className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-50">
                    <span className="text-xs font-semibold text-neutral-705 dark:text-neutral-350">Requiere canalización</span>
                    <input type="checkbox" {...register('electricNeedsConduit')} className="rounded border-neutral-300 text-accent focus:ring-accent h-5 w-5" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CAMERAS & DISTANCES */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3 flex justify-between items-center">
                <span>3. Requerimientos de Cámaras</span>
                <button
                  type="button"
                  onClick={() => appendCamera({ position: 'porton', notes: '' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent-hover shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Cámara
                </button>
              </h2>

              {cameraFields.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50">
                  <Video className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">No hay cámaras asignadas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cameraFields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/30 flex flex-col sm:flex-row gap-4 items-end sm:items-center animate-slide-down"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {index + 1}
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Ubicación</label>
                          <select
                            {...register(`cameras.${index}.position` as const)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs"
                          >
                            {CAMERA_POSITIONS.map(pos => (
                              <option key={pos.id} value={pos.id}>{pos.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Observaciones</label>
                          <input
                            type="text"
                            placeholder="Observaciones de instalación..."
                            {...register(`cameras.${index}.notes` as const)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCamera(index)}
                        className="p-2 border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 text-red-650 rounded-lg shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Distances */}
              <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Distancias Estimadas (Metros)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="distanceNvrRouter" className="text-xs font-medium text-neutral-600 dark:text-neutral-400">NVR a Router</label>
                    <input type="number" step="0.1" {...register('distanceNvrRouter', { valueAsNumber: true })} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="distanceTotalCable" className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Metraje Cable Total</label>
                    <input type="number" step="0.5" {...register('distanceTotalCable', { valueAsNumber: true })} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: RECORDING & EQUIPMENT */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                4. Grabación y Acceso Remoto
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Tipo de Grabación</label>
                  <div className="flex gap-4">
                    {RECORDING_TYPES.map(opt => (
                      <label 
                        key={opt.id}
                        className={`flex-1 flex items-center justify-between p-4 border rounded-xl cursor-pointer ${
                          watchRecordingType.includes(opt.id) ? 'border-accent text-accent dark:text-blue-400 font-bold' : 'border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        <span className="text-xs">{opt.label}</span>
                        <input type="checkbox" checked={watchRecordingType.includes(opt.id)} onChange={(e) => handleCheckboxChange('recordingType', opt.id, e.target.checked)} className="rounded text-accent h-4.5 w-4.5" />
                      </label>
                    ))}
                  </div>
                </div>

                {watchRecordingType.includes('nvr') && (
                  <div className="space-y-2 animate-slide-down">
                    <label htmlFor="recordingDiskSize" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Capacidad Disco</label>
                    <select id="recordingDiskSize" {...register('recordingDiskSize')} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm">
                      {DISK_SIZES.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Remote Access */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Acceso Remoto</label>
                  <div className="flex gap-4">
                    {REMOTE_PLATFORMS.map(opt => (
                      <label 
                        key={opt.id}
                        className={`flex-1 flex items-center justify-between p-4 border rounded-xl cursor-pointer ${
                          watchPlatforms.includes(opt.id) ? 'border-accent text-accent dark:text-blue-400 font-bold' : 'border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        <span className="text-xs">{opt.label}</span>
                        <input type="checkbox" checked={watchPlatforms.includes(opt.id)} onChange={(e) => handleCheckboxChange('remoteAccessPlatforms', opt.id, e.target.checked)} className="rounded text-accent h-4.5 w-4.5" />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="remoteAccessUsers" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Usuarios Conectados</label>
                  <input id="remoteAccessUsers" type="number" min={1} {...register('remoteAccessUsers', { valueAsNumber: true })} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm" />
                </div>
              </div>

              {/* Additional equipment */}
              <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Accesorios / Repuestos Requeridos</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {ADDITIONAL_EQUIPMENT.map((eq) => (
                    <label 
                      key={eq.id}
                      className={`flex flex-col justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                        watchEquipment.includes(eq.id) ? 'border-accent bg-accent-soft/20 dark:bg-accent-soft/5 text-accent dark:text-blue-400 font-bold' : 'border-neutral-200 dark:border-neutral-800 text-neutral-600'
                      }`}
                    >
                      <span className="text-xs mb-2 leading-tight">{eq.label}</span>
                      <input type="checkbox" checked={watchEquipment.includes(eq.id)} onChange={(e) => handleCheckboxChange('additionalEquipment', eq.id, e.target.checked)} className="rounded text-accent h-4.5 w-4.5 align-self-end mt-auto" />
                    </label>
                  ))}
                </div>

                <div className="space-y-2 mt-4">
                  <label htmlFor="additionalEquipmentNotes" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Notas Adicionales</label>
                  <textarea id="additionalEquipmentNotes" rows={2} {...register('additionalEquipmentNotes')} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PROPOSAL & RISKS */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                5. Venta Cruzada y Recomendaciones Comerciales
              </h2>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Venta Cruzada</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CROSS_SELL_ITEMS.map((item) => (
                    <label 
                      key={item.id}
                      className={`flex flex-col justify-between p-3.5 border rounded-xl cursor-pointer transition-all ${
                        watchCrossSell.includes(item.id) ? 'border-accent bg-accent-soft/20 dark:bg-accent-soft/5 text-accent dark:text-blue-400 font-bold' : 'border-neutral-200 dark:border-neutral-800 text-neutral-600'
                      }`}
                    >
                      <span className="text-xs mb-2 leading-tight">{item.label}</span>
                      <input type="checkbox" checked={watchCrossSell.includes(item.id)} onChange={(e) => handleCheckboxChange('crossSellItems', item.id, e.target.checked)} className="rounded text-accent h-4.5 w-4.5 align-self-end mt-auto" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Riesgos Identificados</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {RISKS.map((risk) => (
                    <label 
                      key={risk.id}
                      className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                        watchRisks.includes(risk.id) ? 'border-red-500 bg-red-50/10 text-red-650 dark:text-red-400 font-bold' : 'border-neutral-200 dark:border-neutral-800 text-neutral-600'
                      }`}
                    >
                      <input type="checkbox" checked={watchRisks.includes(risk.id)} onChange={(e) => handleCheckboxChange('risksDetected', risk.id, e.target.checked)} className="rounded text-red-600 h-4.5 w-4.5" />
                      <span className="text-xs leading-tight">{risk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Observations */}
              <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="space-y-2">
                  <label htmlFor="recommendedSystem" className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-bold">Sistema Recomendado</label>
                  <input id="recommendedSystem" type="text" {...register('recommendedSystem')} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="estimatedInstallTime" className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-bold">Tiempo Estimado</label>
                    <input id="estimatedInstallTime" type="text" {...register('estimatedInstallTime')} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="observations" className="text-xs font-medium text-neutral-600 dark:text-neutral-400 font-bold">Observaciones Generales</label>
                  <textarea id="observations" rows={3} {...register('observations')} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: PHOTO REGISTRY (NUEVO) */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-neutral-100 dark:border-neutral-850 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  6. Registro Fotográfico de Terreno
                </h2>
                <span className="text-xs font-semibold text-neutral-450 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                  {photoFields.length} / 10 fotos
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-450">
                  Sube fotografías del lugar como evidencia técnica de conectividad, fachada, puntos eléctricos o instalación de cámaras. En dispositivos móviles, puedes presionar el botón para abrir la cámara trasera de tu teléfono de forma directa. (Límite: 10 fotos).
                </p>

                {photoFields.length < 10 && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 hover:bg-neutral-50 dark:hover:bg-neutral-950/20 cursor-pointer transition-colors text-center relative group">
                    <Smartphone className="h-8 w-8 text-neutral-400 group-hover:text-indigo-650 transition-colors mb-2" />
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">Tomar o subir foto</span>
                    <span className="text-[10px] text-neutral-400 mt-1">Formatos permitidos: JPG, PNG (máx. 10 fotos)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      multiple
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                )}

                {photoFields.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {photoFields.map((field, index) => (
                      <div 
                        key={field.id} 
                        className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/20 dark:bg-neutral-950/10 flex gap-4 items-start relative hover:border-neutral-350 dark:hover:border-neutral-750 transition-all"
                      >
                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 dark:border-neutral-800 shrink-0 relative">
                          <img 
                            src={(field as any).url} 
                            alt={`Preview ${index + 1}`} 
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Categoría *</label>
                            <select
                              {...register(`photos.${index}.category` as const)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs"
                            >
                              <option value="fachada">Fachada / Exterior</option>
                              <option value="camara">Ubicación de Cámara</option>
                              <option value="punto_red">Punto de Red / Router</option>
                              <option value="punto_electrico">Alimentación Eléctrica</option>
                              <option value="obstaculo">Obstáculo / Zona Crítica</option>
                              <option value="otro">Otro</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Leyenda (Opcional)</label>
                            <input 
                              type="text"
                              placeholder="Ej: Router principal del cliente"
                              {...register(`photos.${index}.caption` as const)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="p-1.5 border border-neutral-200 dark:border-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-500 hover:text-red-650 rounded-lg shrink-0 transition-colors cursor-pointer self-start"
                          title="Eliminar foto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: STATUS & CLOSING */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                7. Cierre de Visita y Aceptación
              </h2>
              <div className="space-y-2">
                <label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-neutral-400">Estado Final del Registro</label>
                <select id="status" {...register('status')} className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm">
                  <option value="DRAFT">Borrador</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completada (Cerrar)</option>
                </select>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 text-sm font-semibold transition-all"
            >
              Atrás
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Siguiente
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4.5 w-4.5" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    Actualizar Inspección
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  )
}
