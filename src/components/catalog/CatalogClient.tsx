'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Filter, 
  Package, 
  DollarSign, 
  Tags,
  FileText
} from 'lucide-react'
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/products'
import { toast } from 'sonner'

interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  category: string
}

interface CatalogClientProps {
  initialProducts: Product[]
  currentUser: { id: string; role: string }
}

const CATEGORIES = [
  { id: 'all', label: 'Todas las Categorías' },
  { id: 'camara', label: 'Cámaras' },
  { id: 'grabador', label: 'Grabadores (NVR/HDD)' },
  { id: 'conectividad', label: 'Conectividad (Redes)' },
  { id: 'alimentacion', label: 'Alimentación y Energía' },
  { id: 'mano_obra', label: 'Mano de Obra / Servicios' },
  { id: 'otro', label: 'Otros Accesorios' }
]

export default function CatalogClient({ initialProducts, currentUser }: CatalogClientProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    category: 'camara',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdminOrSupervisor = currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR'

  // Open create modal
  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      sku: '',
      name: '',
      price: '',
      category: 'camara',
      description: ''
    })
    setIsModalOpen(true)
  }

  // Open edit modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description || ''
    })
    setIsModalOpen(true)
  }

  // Handle form submit (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.sku || !formData.name || !formData.price || !formData.category) {
      toast.error('Por favor completa todos los campos obligatorios.')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingProduct) {
        // Update product
        const updated = await updateProduct(editingProduct.id, {
          sku: formData.sku.toUpperCase(),
          name: formData.name,
          price: Number(formData.price),
          category: formData.category,
          description: formData.description
        })
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p))
        toast.success('Producto actualizado exitosamente.')
      } else {
        // Create product
        const created = await createProduct({
          sku: formData.sku.toUpperCase(),
          name: formData.name,
          price: Number(formData.price),
          category: formData.category,
          description: formData.description
        })
        setProducts(prev => [created, ...prev])
        toast.success('Producto registrado exitosamente.')
      }
      setIsModalOpen(false)
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al guardar el producto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) return

    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Producto eliminado del catálogo.')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast.error('No se pudo eliminar el producto.')
    }
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Helper label mapping
  const getCategoryLabel = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId)?.label || catId
  }

  return (
    <div className="space-y-6">
      {/* Top search & filter bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4.5 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por SKU o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-650/40 text-neutral-800 dark:text-neutral-100"
          />
        </div>

        {/* Filters and buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4.5 w-4.5 text-neutral-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-semibold focus:outline-none text-neutral-750 dark:text-neutral-200"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {isAdminOrSupervisor && (
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 dark:text-neutral-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-bold">No se encontraron productos en el catálogo.</p>
            <p className="text-xs mt-1 text-neutral-400">Intenta cambiar el término de búsqueda o la categoría.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-neutral-50/50 dark:bg-neutral-950/15 border-b border-neutral-200 dark:border-neutral-800/80 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="px-6 py-4">SKU / Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4 hidden md:table-cell">Descripción</th>
                  {isAdminOrSupervisor && <th className="px-6 py-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850/60">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-950/5 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="font-bold text-neutral-900 dark:text-white">{product.name}</div>
                      <div className="text-xs font-mono text-neutral-400 mt-0.5">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {getCategoryLabel(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-bold text-neutral-850 dark:text-white">
                      ${product.price.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4.5 hidden md:table-cell text-xs text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                      {product.description || '-'}
                    </td>
                    {isAdminOrSupervisor && (
                      <td className="px-6 py-4.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg cursor-pointer transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 border border-neutral-200 dark:border-neutral-850 text-neutral-400 hover:bg-red-50 hover:border-red-200 hover:text-red-650 dark:hover:bg-red-950/20 dark:hover:border-red-900/35 rounded-lg cursor-pointer transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - CRUD Producto (Glassmorphism Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/15">
              <h3 className="font-extrabold text-neutral-850 dark:text-white tracking-tight">
                {editingProduct ? 'Editar Producto del Catálogo' : 'Agregar Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-650 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* SKU */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  SKU / Código Único *
                </label>
                <input
                  type="text"
                  placeholder="Ej: CAM-IP-HIK4M"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                  disabled={!!editingProduct} // SKU no editable al modificar
                />
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cámara IP Hikvision 4MP Domo"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Price & Category Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Precio Unitario ($) *
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 45000"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    {CATEGORIES.slice(1).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Descripción Corta
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalles sobre resolución, distancias de infrarrojo, soporte POE..."
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
