import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Laddar...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}