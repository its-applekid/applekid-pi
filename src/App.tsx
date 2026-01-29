import { useState, useEffect } from 'react'
import { AsciiFace } from './components/AsciiFace'
import type { FaceState } from './components/AsciiFace'
import { ScrollingTicker } from './components/ScrollingTicker'

// Gradient colors for each state - multiple stops for smooth feel
const STATE_GRADIENTS: Record<FaceState, { colors: string[] }> = {
  awake: { 
    colors: ['#FF0420', '#FF3D5A', '#FF6B35', '#FF8C42', '#FF6B35', '#FF0420']
  },
  working: { 
    colors: ['#627EEA', '#7B68EE', '#8C8DFC', '#A78BFA', '#8C8DFC', '#627EEA']
  },
  sleeping: { 
    colors: ['#1a1a2e', '#16213e', '#1e3a5f', '#16213e', '#1a1a2e', '#0f0f1a']
  },
  attention: { 
    colors: ['#FF6B35', '#FF8C42', '#FFD93D', '#FFEC6E', '#FFD93D', '#FF6B35']
  },
  done: { 
    colors: ['#00D395', '#00E5A0', '#00F5A0', '#50FFB0', '#00F5A0', '#00D395']
  },
}

function App() {
  const [faceState, setFaceState] = useState<FaceState>('awake')
  const [time, setTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Cycle through states for demo (remove in production)
  useEffect(() => {
    const states: FaceState[] = ['awake', 'working', 'done', 'attention', 'sleeping']
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % states.length
      setFaceState(states[index] as FaceState)
    }, 10000) // 10 second rotation
    return () => clearInterval(interval)
  }, [])

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

  const gradient = STATE_GRADIENTS[faceState]
  const gradientStr = gradient.colors.map((c, i) => 
    `${c} ${(i / (gradient.colors.length - 1)) * 100}%`
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
      {/* Base animated gradient */}
      <div 
        className="absolute inset-0 animate-gradient-move transition-all duration-[2000ms] ease-in-out"
        style={{
          background: `linear-gradient(135deg, ${gradientStr})`,
          backgroundSize: '400% 400%',
        }}
      />

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
