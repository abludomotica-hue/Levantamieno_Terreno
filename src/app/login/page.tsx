'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const [error, action, isPending] = useActionState(loginAction, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-[#1e1e1e] to-[#0a0a0a] px-4 py-12 sm:px-6 lg:px-8 text-[#fafafa] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0,transparent_50%)] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-105">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#dbeafe] to-[#93c5fd] bg-clip-text text-transparent">
            Ablu Tech
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400">
            Plataforma de Levantamiento Técnico
          </p>
        </div>

        <div className="mt-8 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-8 shadow-2xl shadow-black/50 transition-all duration-300">
          <form action={action} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400 text-sm font-medium animate-slide-down">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Correo o Usuario
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                required
                className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                placeholder="admin o correo@ablutech.cl"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-600/25"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Iniciando sesión...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-800/80 pt-4 text-center">
            <p className="text-xs text-neutral-500">
              Uso exclusivo para personal técnico autorizado de Ablu Tech.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
