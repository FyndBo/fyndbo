'use client'
import { useEffect, useRef } from 'react'

export default function Background3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width
    canvas.height = height

    // Rita en stor röd cirkel (test)
    ctx.fillStyle = '#ff4444'
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, 100, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = '30px Arial'
    ctx.fillText('Canvas fungerar!', width / 2 - 100, height / 2 + 50)
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 w-full h-full" />
}