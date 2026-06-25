import { z } from 'zod'

export const inspectionSchema = z.object({
  clientId: z.string().min(1, 'El cliente es requerido'),
  visitId: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED']),
  visitDate: z.date(),
  
  // Ubicación
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  
  // Objetivos del cliente
  customerObjectives: z.array(z.string()),
  
  // Tipo de propiedad
  propertyType: z.string().min(1, 'El tipo de propiedad es requerido'),
  floors: z.number().int().min(1),
  installationType: z.string().min(1, 'El tipo de instalación es requerido'),
  
  // Internet existente
  internetFiber: z.boolean(),
  internetRouter: z.boolean(),
  internetWifiGood: z.boolean(),
  internetNeedsRepeater: z.boolean(),
  
  // Punto eléctrico
  electricNearbyOutlet: z.boolean(),
  electricNeedsPoint: z.boolean(),
  electricNeedsConduit: z.boolean(),
  
  // Distancias (metros)
  distanceNvrRouter: z.number().nonnegative('Debe ser un número positivo').optional().nullable(),
  distanceCamera1: z.number().nonnegative('Debe ser un número positivo').optional().nullable(),
  distanceCamera2: z.number().nonnegative('Debe ser un número positivo').optional().nullable(),
  distanceCamera3: z.number().nonnegative('Debe ser un número positivo').optional().nullable(),
  distanceCamera4: z.number().nonnegative('Debe ser un número positivo').optional().nullable(),
  distanceTotalCable: z.number().nonnegative('Debe ser un número positivo').optional().nullable(),
  
  // Grabación
  recordingType: z.array(z.string()),
  recordingDiskSize: z.string().optional().nullable(),
  
  // Acceso remoto
  remoteAccessPlatforms: z.array(z.string()),
  remoteAccessUsers: z.number().int().nonnegative().optional().nullable(),
  
  // Equipamiento adicional
  additionalEquipment: z.array(z.string()),
  additionalEquipmentNotes: z.string().optional().nullable(),
  
  // Venta cruzada
  crossSellItems: z.array(z.string()),
  
  // Riesgos detectados
  risksDetected: z.array(z.string()),
  
  // Observaciones y recomendaciones
  observations: z.string().optional().nullable(),
  recommendedSystem: z.string().optional().nullable(),
  estimatedInstallTime: z.string().optional().nullable(),
  
  // Fotos de terreno
  photos: z.array(z.object({
    url: z.string().min(1, 'La imagen es requerida'),
    category: z.string().min(1, 'La categoría es requerida'),
    caption: z.string().optional().nullable()
  })).max(10, 'Puedes subir hasta 10 fotos en total'),

  // Cámaras requeridas (Sección 4)
  cameras: z.array(z.object({
    position: z.string().min(1, 'La ubicación es requerida'),
    notes: z.string().optional().nullable(),
  })),
})

export type InspectionFormData = z.infer<typeof inspectionSchema>
