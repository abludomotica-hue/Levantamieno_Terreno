'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center justify-center gap-2 px-4.5 py-2.5 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-xl text-xs font-semibold text-neutral-850 dark:text-neutral-200 cursor-pointer transition-all duration-200"
    >
      <Printer className="h-4.5 w-4.5" />
      Imprimir Informe
    </button>
  )
}
