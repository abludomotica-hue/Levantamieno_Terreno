'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  Eye, 
  Edit3, 
  Calculator, 
  Package, 
  PlusCircle, 
  FileText,
  CheckCircle,
  HelpCircle
} from 'lucide-react'
import { createOrUpdateQuote } from '@/app/actions/quotes'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface CatalogProduct {
  id: string
  sku: string
  name: string
  price: number
  category: string
  description: string | null
}

interface QuoteItem {
  id?: string // DB id if exists
  localId: string // Unique key for UI rendering/state tracking
  name: string
  price: number
  quantity: number
}

interface Inspection {
  id: string
  visitDate: Date | string
  client: {
    name: string
    address: string
    phone: string
    email: string | null
  }
  technician: {
    name: string
    email: string
  }
  recommendedSystem: string | null
  estimatedInstallTime: string | null
  observations: string | null
}

interface ExistingQuote {
  id: string
  notes: string | null
  totalAmount: number
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    total: number
  }>
}

interface QuoteClientProps {
  inspectionId: string
  inspection: Inspection
  catalogProducts: CatalogProduct[]
  existingQuote: ExistingQuote | null
  preloadedItems: Array<{ name: string; price: number; quantity: number }>
}

const CATEGORY_LABELS: Record<string, string> = {
  camara: 'Cámaras',
  grabador: 'Grabadores (NVR/HDD)',
  conectividad: 'Conectividad (Redes)',
  alimentacion: 'Alimentación y Energía',
  mano_obra: 'Mano de Obra / Servicios',
  otro: 'Otros Accesorios'
}

export default function QuoteClient({
  inspectionId,
  inspection,
  catalogProducts,
  existingQuote,
  preloadedItems
}: QuoteClientProps) {
  const router = useRouter()
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Initialize items from existing quote or preloaded (suggested) items
  const [items, setItems] = useState<QuoteItem[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (existingQuote) {
      setItems(
        existingQuote.items.map(item => ({
          id: item.id,
          localId: `db-${item.id}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      )
      setNotes(existingQuote.notes || '')
    } else {
      setItems(
        preloadedItems.map((item, idx) => ({
          localId: `preloaded-${idx}-${Date.now()}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      )
      setNotes(
        `Condiciones Comerciales:\n- Forma de pago: 50% de pie al inicio, 50% al término de la instalación.\n- Validez de la cotización: 15 días.\n- Tiempo estimado de ejecución: ${inspection.estimatedInstallTime || 'A convenir'}.\n- Garantía del equipamiento: 1 año.`
      )
    }
  }, [existingQuote, preloadedItems, inspection.estimatedInstallTime])

  // Catalog search states
  const [searchQuery, setSearchQuery] = useState('')
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<CatalogProduct[]>([])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(catalogProducts.slice(0, 8)) // Show first 8 initially
    } else {
      const filtered = catalogProducts.filter(
        p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category && CATEGORY_LABELS[p.category]?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredProducts(filtered)
    }
  }, [searchQuery, catalogProducts])

  // Calculation values
  const subtotalNeto = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const iva = Math.round(subtotalNeto * 0.19)
  const totalGeneral = subtotalNeto + iva

  // Add blank manual item row
  const addManualItem = () => {
    setItems(prev => [
      ...prev,
      {
        localId: `manual-${Date.now()}-${Math.random()}`,
        name: '',
        price: 0,
        quantity: 1
      }
    ])
    toast.success('Nueva línea vacía agregada.')
  }

  // Add item from catalog
  const addCatalogItem = (product: CatalogProduct) => {
    // Check if product already added (optional check, we allow multiple identical products)
    setItems(prev => [
      ...prev,
      {
        localId: `catalog-${product.id}-${Date.now()}`,
        name: product.name,
        price: product.price,
        quantity: 1
      }
    ])
    setShowCatalogDropdown(false)
    setSearchQuery('')
    toast.success(`"${product.name}" agregado a la cotización.`)
  }

  // Remove line item
  const removeItem = (localId: string) => {
    setItems(prev => prev.filter(item => item.localId !== localId))
  }

  // Update line item details
  const updateItemField = (localId: string, field: 'name' | 'price' | 'quantity', value: any) => {
    setItems(prev => 
      prev.map(item => {
        if (item.localId !== localId) return item
        
        let processedValue = value
        if (field === 'price') {
          processedValue = value === '' ? 0 : Number(value)
        } else if (field === 'quantity') {
          processedValue = value === '' ? 0 : parseInt(value, 10)
        }

        return {
          ...item,
          [field]: processedValue
        }
      })
    )
  }

  // Save quote handler
  const handleSaveQuote = async () => {
    // Validation
    const invalidItems = items.filter(item => !item.name.trim() || item.price < 0 || item.quantity <= 0)
    if (invalidItems.length > 0) {
      toast.error('Por favor corrige los ítems con nombres vacíos o cantidades/precios no válidos.')
      return
    }

    if (items.length === 0) {
      toast.error('La cotización debe tener al menos un ítem.')
      return
    }

    setIsSaving(true)
    try {
      const payloadItems = items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))

      await createOrUpdateQuote(inspectionId, {
        items: payloadItems,
        notes: notes
      })

      toast.success('Presupuesto comercial guardado exitosamente.')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al guardar la cotización.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      
      {/* Action Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push(`/inspections/${inspectionId}`)}
            className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Volver a la Ficha
            </span>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-indigo-600" />
              Cotizador: {inspection.client.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View Mode */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isPreviewMode 
                ? 'bg-neutral-150 border-neutral-350 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                : 'bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            {isPreviewMode ? (
              <>
                <Edit3 className="h-4 w-4" />
                Modo Edición
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Vista Previa PDF
              </>
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveQuote}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shadow-indigo-600/10 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar Presupuesto'}
          </button>

          {/* Print PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-950 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Imprimir PDF
          </button>
        </div>
      </div>

      {/* Warning/Info Alerts - Hidden on Print */}
      {!existingQuote && !isPreviewMode && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-150/60 dark:border-indigo-900/35 rounded-2xl p-4 flex gap-3 items-start print:hidden">
          <HelpCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
            <span className="font-bold">Precarga Técnica Inteligente:</span> Hemos analizado los requerimientos del levantamiento (cámaras, cableado, NVR y equipamiento) y precargado automáticamente productos reales de tu catálogo con precios vigentes. Puedes modificar, añadir o eliminar cualquier línea según requieras.
          </div>
        </div>
      )}

      {/* Main Container */}
      {isPreviewMode ? (
        /* PRINT PREVIEW SHEET (Invocal Design Layout) */
        <div className="bg-white border border-neutral-200 shadow-xl rounded-2xl p-8 max-w-4xl mx-auto text-neutral-800 font-sans print:border-none print:shadow-none print:p-0">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-neutral-200 pb-6 mb-6">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-black tracking-tight text-neutral-950 uppercase">ABLU TECH</h2>
              <p className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest">Sistemas de Seguridad y Automatización</p>
              <div className="text-xs text-neutral-500 pt-2 space-y-0.5">
                <p>Ablu Domótica SpA</p>
                <p>Santiago, Chile</p>
                <p>Contacto: contacto@ablutech.cl</p>
              </div>
            </div>
            
            <div className="text-right mt-4 sm:mt-0 space-y-1">
              <span className="inline-flex px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-neutral-200">
                Presupuesto Comercial
              </span>
              <p className="text-xs text-neutral-500 mt-1.5">N° Inspección: <span className="font-mono text-neutral-800">{inspectionId.slice(0, 8).toUpperCase()}</span></p>
              <p className="text-xs text-neutral-500">Fecha Emisión: {formatDate(new Date())}</p>
              <p className="text-xs text-neutral-500">Validez: 15 días</p>
            </div>
          </div>

          {/* Client & Technical Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50/70 border border-neutral-150 rounded-xl p-4 mb-6 text-xs">
            {/* Client Info */}
            <div className="space-y-2">
              <h3 className="font-bold text-[10px] uppercase text-neutral-450 tracking-wider">Información del Cliente</h3>
              <div className="space-y-1 text-neutral-750">
                <p><span className="font-semibold text-neutral-500">Cliente:</span> {inspection.client.name}</p>
                <p><span className="font-semibold text-neutral-500">Dirección:</span> {inspection.client.address}</p>
                <p><span className="font-semibold text-neutral-500">Teléfono:</span> {inspection.client.phone}</p>
                {inspection.client.email && <p><span className="font-semibold text-neutral-500">Email:</span> {inspection.client.email}</p>}
              </div>
            </div>

            {/* Technical Detail Info */}
            <div className="space-y-2">
              <h3 className="font-bold text-[10px] uppercase text-neutral-450 tracking-wider">Detalles del Levantamiento</h3>
              <div className="space-y-1 text-neutral-750">
                <p><span className="font-semibold text-neutral-500">Técnico Formulador:</span> {inspection.technician.name}</p>
                <p><span className="font-semibold text-neutral-500">Fecha Levantamiento:</span> {formatDate(inspection.visitDate)}</p>
                {inspection.recommendedSystem && <p><span className="font-semibold text-neutral-500">Sistema Propuesto:</span> {inspection.recommendedSystem}</p>}
                {inspection.estimatedInstallTime && <p><span className="font-semibold text-neutral-500">Plazo de Instalación:</span> {inspection.estimatedInstallTime}</p>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 font-bold border-b border-neutral-200 text-neutral-700">
                  <th className="px-4 py-3">Descripción del Producto / Servicio</th>
                  <th className="px-4 py-3 text-right w-24">Cant.</th>
                  <th className="px-4 py-3 text-right w-32">Precio Unit.</th>
                  <th className="px-4 py-3 text-right w-36">Total Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3 font-medium text-neutral-900">{item.name || 'Línea de cotización sin título'}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-neutral-700">${item.price.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">${(item.price * item.quantity).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
            {/* Notes/T&C */}
            <div className="text-xs text-neutral-500 space-y-1">
              <h4 className="font-bold text-[10px] text-neutral-450 uppercase tracking-wider">Términos & Condiciones</h4>
              <p className="whitespace-pre-line leading-relaxed">{notes || 'No se registraron observaciones adicionales.'}</p>
            </div>

            {/* Calculations */}
            <div className="border border-neutral-200 rounded-xl bg-neutral-50/30 p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-neutral-550 border-b border-neutral-150 pb-2">
                <span>Subtotal Neto:</span>
                <span className="font-semibold text-neutral-800">${subtotalNeto.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-550 border-b border-neutral-150 pb-2">
                <span>IVA (19%):</span>
                <span className="font-semibold text-neutral-800">${iva.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-900 text-sm font-bold pt-1">
                <span>Total Comercial:</span>
                <span className="text-indigo-650 font-black">${totalGeneral.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          {/* Signatures Panel - Visible on Print and Print Preview */}
          <div className="mt-20 grid grid-cols-2 gap-12 text-center text-[10px] text-neutral-500 print:break-inside-avoid">
            <div className="space-y-1">
              <div className="w-48 mx-auto border-t border-neutral-300 pt-2" />
              <p className="font-bold uppercase text-neutral-700">Firma Técnico Responsable</p>
              <p>Representante Técnico - Ablu Tech</p>
            </div>
            <div className="space-y-1">
              <div className="w-48 mx-auto border-t border-neutral-300 pt-2" />
              <p className="font-bold uppercase text-neutral-700">Aceptación de Presupuesto</p>
              <p>Nombre del Cliente: {inspection.client.name}</p>
            </div>
          </div>

        </div>
      ) : (
        /* EDITING MODE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Columns: Item List Editor (Col Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Products Builder Table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="px-6 py-4.5 border-b border-neutral-150 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-950/15 flex justify-between items-center">
                <h3 className="font-bold text-neutral-850 dark:text-white tracking-tight flex items-center gap-1.5">
                  <Package className="h-4.5 w-4.5 text-indigo-600" />
                  Detalle del Presupuesto
                </h3>
                <span className="text-xs text-neutral-450 dark:text-neutral-500 font-mono">
                  {items.length} {items.length === 1 ? 'línea' : 'líneas'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/50 dark:bg-neutral-950/10 border-b border-neutral-200 dark:border-neutral-800/80 text-xs font-bold text-neutral-450 uppercase tracking-wider">
                      <th className="px-4 py-3">Descripción Producto / Servicio</th>
                      <th className="px-4 py-3 w-28 text-right">Precio Unit ($)</th>
                      <th className="px-4 py-3 w-20 text-right">Cant.</th>
                      <th className="px-4 py-3 w-32 text-right">Total ($)</th>
                      <th className="px-4 py-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150 dark:divide-neutral-850/60">
                    {items.map((item) => (
                      <tr key={item.localId} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-950/5 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItemField(item.localId, 'name', e.target.value)}
                            placeholder="Nombre del producto o descripción del servicio..."
                            className="w-full bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-indigo-600 dark:hover:border-neutral-700 dark:focus:border-indigo-500 py-1 px-1.5 text-sm text-neutral-800 dark:text-neutral-100 font-semibold focus:outline-none transition-all"
                            required
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItemField(item.localId, 'price', e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-indigo-600 dark:hover:border-neutral-700 dark:focus:border-indigo-500 py-1 px-1.5 text-right font-mono text-neutral-800 dark:text-neutral-100 text-sm focus:outline-none"
                            required
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemField(item.localId, 'quantity', e.target.value)}
                            placeholder="1"
                            className="w-full bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-indigo-600 dark:hover:border-neutral-700 dark:focus:border-indigo-500 py-1 px-1.5 text-right font-mono text-neutral-800 dark:text-neutral-100 text-sm focus:outline-none"
                            required
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-neutral-800 dark:text-white">
                          ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.localId)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-450 dark:text-neutral-500">
                          No hay líneas de cotización creadas. Usa los botones inferiores para agregar productos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons to Add Lines */}
              <div className="px-6 py-4.5 bg-neutral-50/50 dark:bg-neutral-950/15 border-t border-neutral-150 dark:border-neutral-850 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={addManualItem}
                  className="flex items-center gap-1.5 px-4 py-2 border border-neutral-200 hover:bg-white dark:border-neutral-800 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4 text-neutral-450" />
                  Agregar Fila Manual
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCatalogDropdown(!showCatalogDropdown)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-950 text-white dark:bg-white dark:hover:bg-neutral-50 dark:text-neutral-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar del Catálogo
                  </button>

                  {/* Catalog Selector Dropdown */}
                  {showCatalogDropdown && (
                    <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl z-30 p-3.5 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-900">
                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Productos del Catálogo</h4>
                        <button 
                          onClick={() => setShowCatalogDropdown(false)}
                          className="text-[10px] text-neutral-400 hover:text-neutral-700"
                        >
                          Cerrar
                        </button>
                      </div>
                      
                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Buscar SKU o nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100"
                      />

                      {/* Dropdown list */}
                      <div className="max-h-56 overflow-y-auto space-y-1">
                        {filteredProducts.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addCatalogItem(p)}
                            className="w-full text-left p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg flex justify-between items-start gap-2 text-xs transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-neutral-800 dark:text-neutral-200 truncate">{p.name}</p>
                              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{p.sku} | {CATEGORY_LABELS[p.category] || p.category}</p>
                            </div>
                            <span className="font-bold text-indigo-650 shrink-0">${p.price.toLocaleString('es-CL')}</span>
                          </button>
                        ))}
                        {filteredProducts.length === 0 && (
                          <p className="text-center py-4 text-[11px] text-neutral-450">No se encontraron productos.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms & Conditions/Observations */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-3.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-450 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-600" />
                Notas y Condiciones del Presupuesto
              </h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indica las formas de pago, garantías, tiempos de ejecución y validez de la oferta..."
                rows={5}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-850 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/40 resize-none leading-relaxed"
              />
            </div>

          </div>

          {/* Right Column: Calculations & Total Summary Panel */}
          <div className="space-y-6">
            
            {/* Calculation Totals Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-450 border-b border-neutral-100 dark:border-neutral-850 pb-2">
                Resumen Financiero
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-neutral-550 dark:text-neutral-400">
                  <span>Subtotal Neto:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">${subtotalNeto.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-550 dark:text-neutral-400">
                  <span>IVA (19%):</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">${iva.toLocaleString('es-CL')}</span>
                </div>
                
                <div className="border-t border-neutral-150 dark:border-neutral-800 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Total Final:</span>
                  <span className="text-lg font-black text-indigo-650 font-mono">${totalGeneral.toLocaleString('es-CL')}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveQuote}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer shadow-indigo-600/10 disabled:opacity-50"
                >
                  <Save className="h-4.5 w-4.5" />
                  {isSaving ? 'Guardando...' : 'Guardar Presupuesto'}
                </button>
              </div>
            </div>

            {/* Inspection Info Reference Card */}
            <div className="bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-450 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                Referencia del Levantamiento
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Cliente</p>
                  <p className="mt-0.5 text-neutral-800 dark:text-neutral-200 font-semibold">{inspection.client.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Ubicación de Obra</p>
                  <p className="mt-0.5 text-neutral-700 dark:text-neutral-350">{inspection.client.address}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Sistema Sugerido Técnico</p>
                  <p className="mt-0.5 text-neutral-750 dark:text-neutral-300 font-medium">{inspection.recommendedSystem || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Técnico Formulador</p>
                  <p className="mt-0.5 text-neutral-750 dark:text-neutral-300">{inspection.technician.name}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
