'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  MapPin, 
  Trash2, 
  X, 
  FileText, 
  AlertCircle,
  CheckCircle,
  FileClock,
  Play
} from 'lucide-react'
import { createVisit, deleteVisit, updateVisitStatus } from '@/app/actions/visits'
import { toast } from 'sonner'
import { Client } from '@prisma/client'

interface Visit {
  id: string
  clientId: string
  technicianId: string
  visitDate: string
  status: string
  notes: string | null
  client: Client
  technician: {
    id: string
    name: string
    email: string
  }
  inspection?: {
    id: string
    status: string
  } | null
}

interface ScheduleCalendarProps {
  initialVisits: Visit[]
  clients: Client[]
  technicians: { id: string; name: string; email: string }[]
  currentUser: { id: string; role: string }
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

export default function ScheduleCalendar({
  initialVisits,
  clients,
  technicians,
  currentUser
}: ScheduleCalendarProps) {
  const router = useRouter()
  const [visits, setVisits] = useState<Visit[]>(initialVisits)
  
  // Date states
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newVisit, setNewVisit] = useState({
    clientId: '',
    technicianId: '',
    date: '',
    time: '09:00',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdminOrSupervisor = currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR'

  // Calendar calculations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Helper: check if two dates are same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  // Handle month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Get visits for a specific date
  const getVisitsForDate = (date: Date) => {
    return visits.filter(visit => {
      const visitDate = new Date(visit.visitDate)
      return isSameDay(visitDate, date)
    })
  }

  // Format time (HH:MM) from ISO string
  const formatTime = (isoString: string) => {
    const d = new Date(isoString)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Save new visit
  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVisit.clientId || !newVisit.technicianId || !newVisit.date || !newVisit.time) {
      toast.error('Por favor completa los campos requeridos.')
      return
    }

    setIsSubmitting(true)
    try {
      const combinedDate = new Date(`${newVisit.date}T${newVisit.time}`)
      
      const created = await createVisit({
        clientId: newVisit.clientId,
        technicianId: newVisit.technicianId,
        visitDate: combinedDate,
        notes: newVisit.notes
      })

      toast.success('Visita técnica programada con éxito.')
      
      // Update local state by refetching or appending (simplest is page refresh)
      router.refresh()
      setIsModalOpen(false)
      setNewVisit({
        clientId: '',
        technicianId: '',
        date: '',
        time: '09:00',
        notes: ''
      })
      
      // We simulate refetching local state by reloading page, 
      // but in Next.js App Router router.refresh() will refresh server props.
      // We delay state update slightly to let server return new props.
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err: any) {
      console.error(err)
      toast.error('Ocurrió un error al agendar la visita.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete visit
  const handleDeleteVisit = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta visita programada?')) return

    try {
      await deleteVisit(id)
      toast.success('Visita técnica eliminada.')
      setVisits(prev => prev.filter(v => v.id !== id))
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('No se pudo eliminar la visita.')
    }
  }

  // Update visit status
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateVisitStatus(id, status)
      toast.success(`Estado de visita actualizado a: ${status === 'CANCELLED' ? 'Cancelado' : status}`)
      setVisits(prev => prev.map(v => v.id === id ? { ...v, status } : v))
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar estado.')
    }
  }

  const selectedDayVisits = getVisitsForDate(selectedDate)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Calendar Area */}
      <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold tracking-tight text-neutral-850 dark:text-white uppercase">
              {MONTHS[month]} {year}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-350 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-350 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
            {isAdminOrSupervisor && (
              <button
                onClick={() => {
                  const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                  setNewVisit(prev => ({ ...prev, date: formattedDate }))
                  setIsModalOpen(true)
                }}
                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shadow-indigo-600/10"
              >
                <Plus className="h-4 w-4" />
                Agendar
              </button>
            )}
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 text-center mb-2">
          {DAYS_OF_WEEK.map((day, idx) => (
            <span key={idx} className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest py-1">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 border-t border-neutral-100 dark:border-neutral-800/80 pt-2">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 md:h-20" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNumber = idx + 1
            const thisDayDate = new Date(year, month, dayNumber)
            const dayVisits = getVisitsForDate(thisDayDate)
            const isSelected = isSameDay(thisDayDate, selectedDate)
            const isToday = isSameDay(thisDayDate, new Date())

            return (
              <button
                key={`day-${dayNumber}`}
                onClick={() => setSelectedDate(thisDayDate)}
                className={`h-16 md:h-20 p-1.5 flex flex-col justify-between items-start border rounded-xl transition-all cursor-pointer text-left focus:outline-none ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 dark:border-indigo-500 ring-2 ring-indigo-600/10'
                    : isToday
                      ? 'border-indigo-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60'
                      : 'border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-850/40'
                }`}
              >
                <span className={`text-xs font-bold h-6 w-6 rounded-md flex items-center justify-center ${
                  isToday 
                    ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                    : isSelected
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'text-neutral-700 dark:text-neutral-350'
                }`}>
                  {dayNumber}
                </span>

                {/* Display dots for visits */}
                {dayVisits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto w-full max-h-5 overflow-hidden">
                    {dayVisits.map((v) => {
                      let dotColor = 'bg-indigo-500'
                      if (v.status === 'COMPLETED') dotColor = 'bg-emerald-500'
                      if (v.status === 'IN_PROGRESS') dotColor = 'bg-amber-500'
                      if (v.status === 'CANCELLED') dotColor = 'bg-rose-500'
                      return (
                        <span 
                          key={v.id} 
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`}
                          title={`${v.client.name} - ${v.status}`}
                        />
                      )
                    })}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Visits Detail Area */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4 h-full min-h-[400px]">
        <div className="border-b border-neutral-100 dark:border-neutral-850 pb-3">
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
            Visitas del Día
          </h3>
          <p className="text-sm font-extrabold text-neutral-800 dark:text-white mt-1">
            {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {selectedDayVisits.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 dark:text-neutral-500">
            <FileClock className="h-10 w-10 mx-auto mb-2 text-neutral-300 dark:text-neutral-700" />
            <p className="text-xs font-semibold">No hay visitas programadas para este día.</p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
            {selectedDayVisits.map((visit) => (
              <div 
                key={visit.id}
                className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/20 dark:bg-neutral-950/10 space-y-3.5"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-extrabold flex items-center gap-1 text-indigo-650 dark:text-indigo-400">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(visit.visitDate)} hs
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      visit.status === 'COMPLETED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                        : visit.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                          : visit.status === 'CANCELLED'
                            ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                            : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600'
                    }`}>
                      {visit.status === 'COMPLETED' ? 'Realizada' : visit.status === 'IN_PROGRESS' ? 'En Curso' : visit.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-neutral-850 dark:text-white">
                    {visit.client.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span>{visit.client.address}</span>
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span>Técnico: <span className="font-semibold">{visit.technician.name}</span></span>
                  </p>
                  {visit.notes && (
                    <div className="text-xs text-neutral-600 dark:text-neutral-450 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800 mt-2">
                      <p className="font-bold text-[10px] text-neutral-400 uppercase tracking-wide">Notas del Admin:</p>
                      <p className="mt-0.5 italic">"{visit.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Actions per visit */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-850">
                  {visit.status !== 'COMPLETED' && visit.status !== 'CANCELLED' && (
                    <>
                      {/* Start / Continue Inspection */}
                      <button
                        onClick={() => {
                          handleUpdateStatus(visit.id, 'IN_PROGRESS')
                          router.push(`/inspections/new?clientId=${visit.clientId}&visitId=${visit.id}`)
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs shadow-indigo-600/5"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Comenzar
                      </button>

                      {/* Cancel Button */}
                      <button
                        onClick={() => handleUpdateStatus(visit.id, 'CANCELLED')}
                        className="p-2 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-500 hover:text-rose-650 rounded-lg cursor-pointer transition-colors"
                        title="Cancelar visita"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {visit.status === 'COMPLETED' && visit.inspection && (
                    <button
                      onClick={() => router.push(`/inspections/${visit.inspection?.id}`)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Ver Ficha Técnica
                    </button>
                  )}

                  {/* Admin Delete Action */}
                  {isAdminOrSupervisor && (
                    <button
                      onClick={() => handleDeleteVisit(visit.id)}
                      className="p-2 border border-neutral-250 dark:border-neutral-800 text-neutral-500 hover:bg-red-50 hover:border-red-200 hover:text-red-650 dark:hover:bg-red-950/20 dark:hover:border-red-900/35 rounded-lg cursor-pointer transition-all duration-150"
                      title="Eliminar registro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Agendar Nueva Visita (Glassmorphism Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/15">
              <h3 className="font-extrabold text-neutral-850 dark:text-white tracking-tight">
                Programar Nueva Visita Técnica
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-650 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="p-6 space-y-4">
              {/* Select Client */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Seleccionar Cliente *
                </label>
                <select
                  value={newVisit.clientId}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, clientId: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Selecciona un cliente --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Technician */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Asignar Técnico *
                </label>
                <select
                  value={newVisit.technicianId}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, technicianId: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Selecciona un técnico --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Date and Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={newVisit.date}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={newVisit.time}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Notas Adicionales
                </label>
                <textarea
                  value={newVisit.notes}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Instrucciones especiales para el técnico o el cliente..."
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
                  className="px-4.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Programar Visita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
