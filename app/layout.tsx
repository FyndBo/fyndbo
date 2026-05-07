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
      <body className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        {children}
      </body>
    </html>
  )
}