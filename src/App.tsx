import { useState, useEffect } from 'react'
import { SunnyFace } from './components/SunnyFace'
import type { FaceState } from './components/SunnyFace'
import { ScrollingTicker } from './components/ScrollingTicker'

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
    }, 5000)
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

  return (
    <div 
      className="h-full w-full flex flex-col"
      style={{ 
        backgroundColor: '#1a1a1a',
        maxWidth: '480px',
        maxHeight: '320px',
        margin: '0 auto',
      }}
    >
      {/* Status bar */}
      <div className="flex justify-between items-center px-3 py-1 text-xs text-gray-400">
        <span>{formattedTime}</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Online</span>
        </span>
      </div>

      {/* Main content - Face */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <SunnyFace state={faceState} size={160} />
        <p 
          className="mt-2 text-sm font-medium"
          style={{ color: '#FF0420' }}
        >
          {stateLabel[faceState]}
        </p>
      </div>

      {/* Scrolling ticker */}
      <ScrollingTicker message="GM" speed={8} />
    </div>
  )
}

export default App
