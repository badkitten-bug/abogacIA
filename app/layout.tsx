import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ABOGAC.IA - Tu Asistente Legal 24/7',
  description: 'ABOGAC.IA es como tener un asistente legal en tu celular disponible 24/7: le haces una pregunta y te explica tus derechos de forma clara, rápida y confiable.',
  keywords: 'asistente legal, consultas legales, abogado virtual, Perú, derecho, legal AI',
  openGraph: {
    title: 'ABOGAC.IA - Tu Asistente Legal 24/7',
    description: 'Respuesta legal que necesitas, cuando la necesitas.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
