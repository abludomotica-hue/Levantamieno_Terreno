import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { STATUS_LABELS } from '@/constants'

/**
 * Combina clases CSS con soporte para Tailwind merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha en formato legible en español.
 * Ejemplo: "25 de junio de 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Devuelve la etiqueta en español para un estado de inspección.
 */
export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status
}

/**
 * Genera un identificador único (UUID v4).
 */
export function generateId(): string {
  return crypto.randomUUID()
}
