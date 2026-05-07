import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FyndBo.se',
  description: 'Hitta ditt nästa hem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className="bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900">
        {children}
      </body>
    </html>
  )
}