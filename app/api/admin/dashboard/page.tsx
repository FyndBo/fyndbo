'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-lg animate-pulse">Vidarebefordrar till adminpanelen...</div>
    </div>
  )
}