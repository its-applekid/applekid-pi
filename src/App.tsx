import { useState, useEffect, useRef } from 'react'
import { AsciiFace } from './components/AsciiFace'
import type { FaceState } from './components/AsciiFace'
import { ScrollingTicker } from './components/ScrollingTicker'
import { Gradient } from './gradient'
import { usePomodoro } from './components/Pomodoro'
import type { PomodoroPhase } from './components/Pomodoro'
import { Sidebar } from './components/Sidebar'
import { TimerDisplay } from './components/TimerDisplay'

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

// Gradient colors for each face state
type GradientColors = [string, string, string, string]
const STATE_GRADIENTS: Record<FaceState, GradientColors> = {
  awake: [GRUVBOX.orange, GRUVBOX.orangeLight, GRUVBOX.yellow, GRUVBOX.yellowLight],
  working: [GRUVBOX.purple, GRUVBOX.purpleLight, GRUVBOX.blue, GRUVBOX.blueLight],
  sleeping: [GRUVBOX.bg, GRUVBOX.bg1, GRUVBOX.bg2, GRUVBOX.bg1],
  attention: [GRUVBOX.red, GRUVBOX.redLight, GRUVBOX.orange, GRUVBOX.orangeLight],
  done: [GRUVBOX.green, GRUVBOX.greenLight, GRUVBOX.aqua, GRUVBOX.aquaLight],
}

// Pomodoro phase gradients
const POMODORO_GRADIENTS: Record<PomodoroPhase, GradientColors> = {
  work: [GRUVBOX.red, GRUVBOX.redLight, GRUVBOX.orange, GRUVBOX.orangeLight],
  shortBreak: [GRUVBOX.green, GRUVBOX.greenLight, GRUVBOX.aqua, GRUVBOX.aquaLight],
  longBreak: [GRUVBOX.blue, GRUVBOX.blueLight, GRUVBOX.purple, GRUVBOX.purpleLight],
}

const TRANSITION_DURATION = 3000 // 3 seconds

function App() {
  const [targetState, setTargetState] = useState<FaceState>('awake')
  const [displayState, setDisplayState] = useState<FaceState>('awake')
  const [time, setTime] = useState(new Date())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gradientRef = useRef<Gradient | null>(null)
  const faceTimeoutRef = useRef<number | null>(null)
  const demoIntervalRef = useRef<number | null>(null)

  // Pomodoro state
  const pomodoro = usePomodoro({
    onPhaseChange: (phase) => {
      // Update gradient when pomodoro phase changes
      if (gradientRef.current) {
        gradientRef.current.setColors(POMODORO_GRADIENTS[phase], TRANSITION_DURATION)
      }
    },
    onClose: () => {
      // Resume demo mode when pomodoro closes
      startDemoMode()
    },
  })

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

  // Update gradient colors when target state changes (only when not in pomodoro)
  useEffect(() => {
    if (pomodoro.isActive) return
    
    if (gradientRef.current) {
      const colors = STATE_GRADIENTS[targetState]
      gradientRef.current.setColors(colors, TRANSITION_DURATION)
    }
    
    // Clear any pending face update
    if (faceTimeoutRef.current) {
      clearTimeout(faceTimeoutRef.current)
    }
    
    // Schedule face update after transition completes
    faceTimeoutRef.current = window.setTimeout(() => {
      setDisplayState(targetState)
    }, TRANSITION_DURATION)
    
    return () => {
      if (faceTimeoutRef.current) {
        clearTimeout(faceTimeoutRef.current)
      }
    }
  }, [targetState, pomodoro.isActive])

  // Demo mode - cycle through states
  const startDemoMode = () => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
    }
    
    const states: FaceState[] = ['awake', 'working', 'done', 'attention', 'sleeping']
    let index = 0
    
    demoIntervalRef.current = window.setInterval(() => {
      index = (index + 1) % states.length
      setTargetState(states[index])
    }, 10000)
  }

  // Start demo mode on mount
  useEffect(() => {
    startDemoMode()
    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current)
      }
    }
  }, [])

  // Stop demo mode when pomodoro starts
  useEffect(() => {
    if (pomodoro.isActive && demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
  }, [pomodoro.isActive])

  const handleStartPomodoro = () => {
    // Stop demo mode
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
    pomodoro.start()
  }

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const stateLabel = pomodoro.isActive
    ? pomodoro.phase === 'work' ? 'FOCUS' : 'BREAK'
    : {
        awake: 'Ready',
        working: 'Working...',
        sleeping: 'Zzz...',
        attention: 'Hey!',
        done: 'Done!',
      }[displayState]

  const currentColors = pomodoro.isActive 
    ? POMODORO_GRADIENTS[pomodoro.phase]
    : STATE_GRADIENTS[targetState]

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
          '--gradient-color-1': currentColors[0],
          '--gradient-color-2': currentColors[1],
          '--gradient-color-3': currentColors[2],
          '--gradient-color-4': currentColors[3],
        } as React.CSSProperties}
      />

      {/* Main content - 75% height */}
      <div className="relative z-10 flex-1 flex" style={{ height: '75%' }}>
        {/* Left Sidebar */}
        <div className="w-12 flex-shrink-0">
          <Sidebar
            pomodoroActive={pomodoro.isActive}
            pomodoroPaused={pomodoro.isPaused}
            onStartPomodoro={handleStartPomodoro}
            onPause={pomodoro.pause}
            onSkip={pomodoro.skip}
            onReset={pomodoro.reset}
            onClose={pomodoro.close}
          />
        </div>

        {/* Main area */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Status in corner */}
          <div className="absolute top-2 left-1 text-xs text-white/70">
            {formattedTime}
          </div>
          
          {pomodoro.isActive ? (
            // Pomodoro mode layout
            <>
              {/* Face in top right */}
              <div 
                className="absolute top-1 right-2 transition-all duration-500"
              >
                <div className="flex flex-col items-end">
                  <div className="text-xs uppercase tracking-wider text-white/50 mb-1">
                    {stateLabel}
                  </div>
                  <AsciiFace state="working" size="small" />
                </div>
              </div>
              
              {/* Timer in center */}
              <TimerDisplay
                timeRemaining={pomodoro.timeRemaining}
                phase={pomodoro.phase}
                isPaused={pomodoro.isPaused}
              />
            </>
          ) : (
            // Normal mode layout
            <>
              <div className="absolute top-2 right-2 text-xs uppercase tracking-wider text-white/50">
                {stateLabel}
              </div>
              
              {/* Face - centered */}
              <div 
                className="flex items-center justify-center transition-all duration-500"
                style={{ 
                  width: '20%', 
                  height: '100%',
                  maxWidth: '96px',
                }}
              >
                <AsciiFace state={displayState} size="small" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scrolling ticker - 25% height */}
      <div className="relative z-10" style={{ height: '25%' }}>
        <ScrollingTicker message="GM" speed={8} />
      </div>
    </div>
  )
}

export default App
