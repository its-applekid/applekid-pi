import { useState, useEffect, useRef } from 'react'
import { AsciiFace } from './components/AsciiFace'
import type { FaceState } from './components/AsciiFace'
import { ScrollingTicker } from './components/ScrollingTicker'
import { Gradient } from './gradient'

// Gruvbox color palette
const GRUVBOX = {
  bg: '#282828',
  bg1: '#3c3836',
  bg2: '#504945',
  red: '#cc241d',
  redLight: '#fb4934',
  green: '#98971a',
  greenLight: '#b8bb26',
  yellow: '#d79921',
  yellowLight: '#fabd2f',
  blue: '#458588',
  blueLight: '#83a598',
  purple: '#b16286',
  purpleLight: '#d3869b',
  aqua: '#689d6a',
  aquaLight: '#8ec07c',
  orange: '#d65d0e',
  orangeLight: '#fe8019',
}

// Gradient colors for each state - 4 colors for WebGL mesh gradient
type GradientColors = [string, string, string, string]
const STATE_GRADIENTS: Record<FaceState, GradientColors> = {
  awake: [GRUVBOX.orange, GRUVBOX.orangeLight, GRUVBOX.yellow, GRUVBOX.yellowLight],
  working: [GRUVBOX.purple, GRUVBOX.purpleLight, GRUVBOX.blue, GRUVBOX.blueLight],
  sleeping: [GRUVBOX.bg, GRUVBOX.bg1, GRUVBOX.bg2, GRUVBOX.bg1],
  attention: [GRUVBOX.red, GRUVBOX.redLight, GRUVBOX.orange, GRUVBOX.orangeLight],
  done: [GRUVBOX.green, GRUVBOX.greenLight, GRUVBOX.aqua, GRUVBOX.aquaLight],
}

function App() {
  const [faceState, setFaceState] = useState<FaceState>('awake')
  const [time, setTime] = useState(new Date())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gradientRef = useRef<Gradient | null>(null)

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Initialize gradient
  useEffect(() => {
    if (!canvasRef.current) return

    const gradient = new Gradient()
    gradientRef.current = gradient
    gradient.initGradient('#gradient-canvas')

    return () => {
      gradient.pause()
      gradient.disconnect()
    }
  }, [])

  // Update gradient colors when state changes
  useEffect(() => {
    if (canvasRef.current) {
      const colors = STATE_GRADIENTS[faceState]
      const canvas = canvasRef.current
      canvas.style.setProperty('--gradient-color-1', colors[0])
      canvas.style.setProperty('--gradient-color-2', colors[1])
      canvas.style.setProperty('--gradient-color-3', colors[2])
      canvas.style.setProperty('--gradient-color-4', colors[3])
    }
  }, [faceState])

  // Handle state transitions
  const transitionToState = (newState: FaceState) => {
    if (newState === faceState) return
    setFaceState(newState)
  }

  // Cycle through states for demo (remove in production)
  useEffect(() => {
    const states: FaceState[] = ['awake', 'working', 'done', 'attention', 'sleeping']
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % states.length
      transitionToState(states[index] as FaceState)
    }, 10000) // 10 second rotation
    return () => clearInterval(interval)
  }, [faceState])

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const stateLabel = {
    awake: 'Ready',
    working: 'Working...',
    sleeping: 'Zzz...',
    attention: 'Hey!',
    done: 'Done!',
  }

  const currentColors = STATE_GRADIENTS[faceState]

  return (
    <div 
      className="h-screen w-screen flex flex-col overflow-hidden relative"
      style={{ 
        maxWidth: '480px',
        maxHeight: '320px',
        margin: '0 auto',
      }}
    >
      {/* WebGL Mesh Gradient Background */}
      <canvas
        ref={canvasRef}
        id="gradient-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // @ts-ignore - CSS custom properties for gradient colors
          '--gradient-color-1': currentColors[0],
          '--gradient-color-2': currentColors[1],
          '--gradient-color-3': currentColors[2],
          '--gradient-color-4': currentColors[3],
        } as React.CSSProperties}
      />

      {/* Main content - 80% height */}
      <div className="relative z-10 flex-1 flex items-center justify-center" style={{ height: '80%' }}>
        {/* Status in corner */}
        <div className="absolute top-2 left-3 text-xs text-white/70">
          {formattedTime}
        </div>
        <div className="absolute top-2 right-3 text-xs uppercase tracking-wider text-white/50">
          {stateLabel[faceState]}
        </div>
        
        {/* Face - small centered square */}
        <div 
          className="flex items-center justify-center"
          style={{ 
            width: '20%', 
            height: '100%',
            maxWidth: '96px',
          }}
        >
          <AsciiFace state={faceState} size="small" />
        </div>
      </div>

      {/* Scrolling ticker - 20% height */}
      <div className="relative z-10" style={{ height: '20%' }}>
        <ScrollingTicker message="GM" speed={8} />
      </div>
    </div>
  )
}

export default App
