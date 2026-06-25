// Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  TECHNICIAN: 'TECHNICIAN',
  SUPERVISOR: 'SUPERVISOR',
} as const

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
  SUPERVISOR: 'Supervisor',
}

// Inspection statuses
export const INSPECTION_STATUS = {
  DRAFT: 'DRAFT',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
}

// Section 2: Customer Objectives
export const CUSTOMER_OBJECTIVES = [
  { id: 'mascotas', label: 'Identificar mascotas' },
  { id: 'seguridad', label: 'Seguridad general' },
  { id: 'vehiculos', label: 'Proteger vehículos' },
  { id: 'accesos', label: 'Control de accesos' },
  { id: 'encomiendas', label: 'Recepción de encomiendas' },
  { id: 'robos', label: 'Prevención de robos' },
] as const

// Section 3: Property Types
export const PROPERTY_TYPES = [
  { id: 'casa', label: 'Casa' },
  { id: 'condominio', label: 'Condominio' },
  { id: 'parcela', label: 'Parcela' },
  { id: 'comercial', label: 'Local comercial' },
] as const

export const FLOOR_OPTIONS = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3+', label: '3+' },
] as const

// Section 4: Camera positions
export const CAMERA_POSITIONS = [
  { id: 'porton', label: 'Portón' },
  { id: 'antejardin', label: 'Antejardín' },
  { id: 'estacionamiento', label: 'Estacionamiento' },
  { id: 'entrada_principal', label: 'Entrada principal' },
  { id: 'patio_trasero', label: 'Patio trasero' },
  { id: 'pasillo_lateral', label: 'Pasillo lateral' },
  { id: 'interior', label: 'Interior' },
] as const

// Section 5: Installation type
export const INSTALLATION_TYPES = [
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'cableada', label: 'Cableada' },
  { id: 'mixta', label: 'Mixta' },
] as const

// Section 9: Recording options
export const RECORDING_TYPES = [
  { id: 'microsd', label: 'MicroSD' },
  { id: 'nvr', label: 'NVR' },
] as const

export const DISK_SIZES = [
  { id: '1tb', label: 'Disco 1 TB' },
  { id: '2tb', label: 'Disco 2 TB' },
  { id: '4tb', label: 'Disco 4 TB' },
] as const

// Section 10: Remote access
export const REMOTE_PLATFORMS = [
  { id: 'android', label: 'Android' },
  { id: 'iphone', label: 'iPhone' },
] as const

// Section 11: Additional equipment
export const ADDITIONAL_EQUIPMENT = [
  { id: 'ups', label: 'UPS' },
  { id: 'repetidor_wifi', label: 'Repetidor Wi-Fi' },
  { id: 'switch', label: 'Switch' },
  { id: 'cable_utp_cat6', label: 'Cable UTP Cat6' },
  { id: 'canaletas', label: 'Canaletas' },
  { id: 'tubo_pvc', label: 'Tubo PVC' },
  { id: 'caja_derivacion', label: 'Caja de derivación' },
  { id: 'fuente_alimentacion', label: 'Fuente de alimentación' },
  { id: 'proteccion_sobretension', label: 'Protección contra sobretensión' },
  { id: 'rack', label: 'Rack' },
] as const

// Section 12: Cross-sell items
export const CROSS_SELL_ITEMS = [
  { id: 'chapa_inteligente', label: 'Chapa inteligente' },
  { id: 'videoportero', label: 'Videoportero' },
  { id: 'timbre_inteligente', label: 'Timbre inteligente' },
  { id: 'sensor_movimiento', label: 'Sensor de movimiento' },
  { id: 'sensor_apertura', label: 'Sensor de apertura' },
  { id: 'alarma', label: 'Alarma' },
  { id: 'sirena', label: 'Sirena' },
  { id: 'enchufes_inteligentes', label: 'Enchufes inteligentes' },
  { id: 'ampolletas_inteligentes', label: 'Ampolletas inteligentes' },
  { id: 'control_voz', label: 'Control por voz' },
  { id: 'pantalla_central', label: 'Pantalla central' },
] as const

// Section 13: Risks
export const RISKS = [
  { id: 'punto_ciego', label: 'Punto ciego' },
  { id: 'baja_iluminacion', label: 'Baja iluminación' },
  { id: 'acceso_sin_proteccion', label: 'Acceso sin protección' },
  { id: 'cable_expuesto', label: 'Cable expuesto' },
  { id: 'wifi_deficiente', label: 'Wi-Fi deficiente' },
  { id: 'vegetacion_bloquea', label: 'Vegetación que bloquea la vista' },
] as const

// Navigation items
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Panel', icon: 'LayoutDashboard' },
  { href: '/inspections', label: 'Inspecciones', icon: 'ClipboardCheck' },
  { href: '/clients', label: 'Clientes', icon: 'Users' },
  { href: '/reports', label: 'Informes', icon: 'FileText' },
] as const
