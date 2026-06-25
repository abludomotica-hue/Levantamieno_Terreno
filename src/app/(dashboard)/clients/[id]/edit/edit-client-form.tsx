'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, ClientFormData } from '@/lib/validations/client'
import { updateClient } from '@/app/actions/clients'
import { toast } from 'sonner'
import { ArrowLeft, User, MapPin, Phone, Mail, FileText, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { Client } from '@prisma/client'

interface EditClientFormProps {
  client: Client
}

export default function EditClientForm({ client }: EditClientFormProps) {
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client.name,
      address: client.address,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || '',
    },
  })

  async function onSubmit(data: ClientFormData) {
    try {
      await updateClient(client.id, data)
      toast.success('Cliente actualizado exitosamente')
      router.push(`/clients/${client.id}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Hubo un error al actualizar los datos. Intente nuevamente.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumbs / Back button */}
      <div className="flex items-center gap-2.5">
        <Link
          href={`/clients/${client.id}`}
          className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Clientes</span>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider truncate max-w-[150px]">
          {client.name}
        </span>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider">Editar</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Editar Cliente</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Actualice la información general del cliente.
        </p>
      </div>

      {/* Card Form */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-neutral-400" />
              Nombre Completo *
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ej: Juan Pérez Muñoz"
              {...register('name')}
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-200 dark:border-neutral-800 focus:ring-blue-500/50 focus:border-blue-500'
              }`}
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500 animate-slide-down">{errors.name.message}</p>
            )}
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
              Dirección *
            </label>
            <input
              id="address"
              type="text"
              placeholder="Ej: Av. Providencia 1234, Dpto 402, Providencia"
              {...register('address')}
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 ${
                errors.address
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-200 dark:border-neutral-800 focus:ring-blue-500/50 focus:border-blue-500'
              }`}
            />
            {errors.address && (
              <p className="text-xs font-medium text-red-500 animate-slide-down">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-neutral-400" />
                Teléfono de Contacto *
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Ej: +56 9 1234 5678"
                {...register('phone')}
                className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 focus:ring-blue-500/50 focus:border-blue-500'
                }`}
              />
              {errors.phone && (
                <p className="text-xs font-medium text-red-500 animate-slide-down">{errors.phone.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                Correo Electrónico (Opcional)
              </label>
              <input
                id="email"
                type="email"
                placeholder="Ej: correo@cliente.com"
                {...register('email')}
                className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 focus:ring-blue-500/50 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-500 animate-slide-down">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-neutral-400" />
              Observaciones / Notas Internas (Opcional)
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Detalles adicionales sobre el cliente..."
              {...register('notes')}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-end gap-3.5">
            <Link
              href={`/clients/${client.id}`}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-850/60 text-sm font-semibold transition-all duration-200"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/10 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4.5 w-4.5" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  Actualizar Cliente
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
