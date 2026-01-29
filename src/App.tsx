import { useState, useEffect } from 'react'
import { AsciiFace } from './components/AsciiFace'
import type { FaceState } from './components/AsciiFace'
import { ScrollingTicker } from './components/ScrollingTicker'

// Gradient colors for each state
const STATE_GRADIENTS: Record<FaceState, { from: string; to: string }> = {
  awake: { from: '#FF0420', to: '#FF6B35' },      // Red-orange (Optimism)
  working: { from: '#627EEA', to: '#8C8DFC' },    // Purple (Ethereum)
  sleeping: { from: '#1a1a2e', to: '#16213e' },   // Dark blue
  attention: { from: '#FF6B35', to: '#FFD93D' },  // Orange-yellow
  done: { from: '#00D395', to: '#00F5A0' },       // Green (success)
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

  return (
    <div 
      className="h-screen w-screen flex flex-col overflow-hidden transition-all duration-1000 ease-in-out"
      style={{ 
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        maxWidth: '480px',
        maxHeight: '320px',
        margin: '0 auto',
      }}
    >
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30 animate-gradient-shift"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%),
                       radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Status bar */}
      <div className="relative z-10 flex justify-between items-center px-3 py-1 text-xs text-white/70">
        <span>{formattedTime}</span>
        <span className="uppercase tracking-wider text-white/50">{stateLabel[faceState]}</span>
      </div>

      {/* Main content - Face */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <AsciiFace state={faceState} />
      </div>

      {/* Scrolling ticker */}
      <div className="relative z-10">
        <ScrollingTicker message="GM" speed={8} />
      </div>
    </div>
  )
}

export default App
