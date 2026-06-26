import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Ablu Tech - Plataforma de Levantamiento Técnico',
  description: 'Sistema premium para inspecciones técnicas de terreno y recopilación de datos de seguridad.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ablu Tech',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
