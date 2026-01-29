import { useEffect, useRef } from 'react'
import { Gradient } from '../gradient'

interface MeshGradientProps {
  colors: [string, string, string, string]  // 4 hex colors
  className?: string
}

export function MeshGradient({ colors, className = '' }: MeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gradientRef = useRef<Gradient | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize the gradient
    const gradient = new Gradient()
    gradientRef.current = gradient
    gradient.initGradient('#gradient-canvas')

    return () => {
      gradient.pause()
      gradient.disconnect()
    }
  }, [])

  // Update colors when they change
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      canvas.style.setProperty('--gradient-color-1', colors[0])
      canvas.style.setProperty('--gradient-color-2', colors[1])
      canvas.style.setProperty('--gradient-color-3', colors[2])
      canvas.style.setProperty('--gradient-color-4', colors[3])
    }
  }, [colors])

  return (
    <canvas
      ref={canvasRef}
      id="gradient-canvas"
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        // @ts-ignore - CSS custom properties
        '--gradient-color-1': colors[0],
        '--gradient-color-2': colors[1],
        '--gradient-color-3': colors[2],
        '--gradient-color-4': colors[3],
      } as React.CSSProperties}
    />
  )
}
