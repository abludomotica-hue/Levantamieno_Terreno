'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-6">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h2 className="font-heading text-2xl font-bold mb-2">Algo salió mal</h2>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">
        Ocurrió un error inesperado al cargar los datos del panel. Esto suele suceder si la Base de Datos no está conectada o las variables de entorno faltan.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Intentar de nuevo
        </button>
        <Link 
          href="/"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-left w-full max-w-2xl overflow-auto border border-red-200 dark:border-red-800/50">
          <p className="font-mono text-xs text-red-600 dark:text-red-400 font-bold mb-1">Detalles técnicos del error:</p>
          <pre className="font-mono text-xs text-red-500 whitespace-pre-wrap">
            {error.message}
          </pre>
        </div>
      )}
    </div>
  )
}
