import { useState, useEffect } from 'react'
import { AsciiFace } from './components/AsciiFace'
import type { FaceState } from './components/AsciiFace'
import { ScrollingTicker } from './components/ScrollingTicker'

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

// Gradient colors for each state - Gruvbox palette
const STATE_GRADIENTS: Record<FaceState, { colors: string[] }> = {
  awake: { 
    colors: [GRUVBOX.orange, GRUVBOX.orangeLight, GRUVBOX.yellow, GRUVBOX.yellowLight, GRUVBOX.orange]
  },
  working: { 
    colors: [GRUVBOX.purple, GRUVBOX.purpleLight, GRUVBOX.blue, GRUVBOX.blueLight, GRUVBOX.purple]
  },
  sleeping: { 
    colors: [GRUVBOX.bg, GRUVBOX.bg1, GRUVBOX.bg2, GRUVBOX.bg1, GRUVBOX.bg]
  },
  attention: { 
    colors: [GRUVBOX.red, GRUVBOX.redLight, GRUVBOX.orange, GRUVBOX.orangeLight, GRUVBOX.red]
  },
  done: { 
    colors: [GRUVBOX.green, GRUVBOX.greenLight, GRUVBOX.aqua, GRUVBOX.aquaLight, GRUVBOX.green]
  },
}

function App() {
  const [faceState, setFaceState] = useState<FaceState>('awake')
  const [prevState, setPrevState] = useState<FaceState>('awake')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [time, setTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle state transitions with crossfade
  const transitionToState = (newState: FaceState) => {
    if (newState === faceState) return
    setPrevState(faceState)
    setIsTransitioning(true)
    setFaceState(newState)
    
    // End transition after 3 seconds
    setTimeout(() => {
      setIsTransitioning(false)
    }, 3000)
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

  const currentGradient = STATE_GRADIENTS[faceState]
  const prevGradient = STATE_GRADIENTS[prevState]
  
  const makeGradientStr = (colors: string[]) => colors.map((c, i) => 
    `${c} ${(i / (colors.length - 1)) * 100}%`
  ).join(', ')

  return (
    <div 
      className="h-screen w-screen flex flex-col overflow-hidden relative"
      style={{ 
        maxWidth: '480px',
        maxHeight: '320px',
        margin: '0 auto',
      }}
    >
      {/* Current state gradient (base layer, always visible) */}
      <div 
        className="absolute inset-0 animate-gradient-move"
        style={{
          background: `linear-gradient(135deg, ${makeGradientStr(currentGradient.colors)})`,
          backgroundSize: '400% 400%',
        }}
      />
      
      {/* Previous state gradient (fades out over 3s when transition starts) */}
      {isTransitioning && (
        <div 
          className="absolute inset-0 animate-gradient-move animate-fade-out"
          style={{
            background: `linear-gradient(135deg, ${makeGradientStr(prevGradient.colors)})`,
            backgroundSize: '400% 400%',
          }}
        />
      )}

      {/* Floating orbs for depth */}
      <div 
        className="absolute inset-0 animate-orb-float pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 40%)`,
        }}
      />
      <div 
        className="absolute inset-0 animate-orb-float-delayed pointer-events-none"
        style={{
          background: `radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1) 0%, transparent 35%)`,
        }}
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
