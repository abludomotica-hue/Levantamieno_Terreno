'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  User, 
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  ClipboardCheck: ClipboardCheck,
  Users: Users,
  FileText: FileText,
  Calendar: Calendar,
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Panel', iconName: 'LayoutDashboard' },
  { href: '/schedule', label: 'Agenda', iconName: 'Calendar' },
  { href: '/inspections', label: 'Inspecciones', iconName: 'ClipboardCheck' },
  { href: '/clients', label: 'Clientes', iconName: 'Users' },
  { href: '/reports', label: 'Informes', iconName: 'FileText' },
] as const

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null)

  // Fetch session data in the client for display (non-blocking)
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/user')
        if (res.ok) {
          const data = await res.json()
          setUserInfo(data)
        }
      } catch (err) {
        console.error('Error fetching session info:', err)
      }
    }
    fetchSession()
  }, [])

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-foreground transition-colors duration-200 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300">
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800 gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            Ablu Tech
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.iconName]
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/60'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              <User className="h-5.5 w-5.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-neutral-800 dark:text-neutral-200">
                {userInfo?.name || 'Cargando...'}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 capitalize truncate">
                {userInfo?.role === 'ADMIN' ? 'Administrador' : userInfo?.role === 'SUPERVISOR' ? 'Supervisor' : 'Técnico'}
              </p>
            </div>
          </div>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-950/20 dark:hover:bg-red-600/90 active:scale-98 transition-all duration-200 border border-red-200/55 dark:border-red-900/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 md:justify-end z-20">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Page Info in topbar for mobile */}
          <span className="md:hidden font-bold text-base bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent flex items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Ablu Tech
          </span>

          <div className="flex items-center gap-4">
            {/* User Profile in Topbar (Desktop) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800/80">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Modo Online
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8 bg-neutral-50 dark:bg-[#080808]">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around px-4 safe-bottom z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.iconName]
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-500'
                    : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Sidebar Overlay / Drawer */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-72 max-w-xs bg-white dark:bg-neutral-900 h-full shadow-2xl animate-slide-right transition-transform">
            <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="font-bold text-base">Ablu Tech</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = iconMap[item.iconName]
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-250 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/80'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-3 px-2 py-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{userInfo?.name || 'Técnico'}</p>
                  <p className="text-xs text-neutral-400 truncate capitalize">{userInfo?.role === 'ADMIN' ? 'Administrador' : userInfo?.role === 'SUPERVISOR' ? 'Supervisor' : 'Técnico'}</p>
                </div>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white dark:bg-red-950/20 dark:hover:bg-red-600/90 transition-all duration-200 border border-red-200/55 dark:border-red-900/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
