import { useState, useEffect, useRef } from 'react'
import { AsciiFace } from './components/AsciiFace'
import type { FaceState } from './components/AsciiFace'
import { ScrollingTicker } from './components/ScrollingTicker'
import { Gradient } from './gradient'
import { usePomodoro } from './components/Pomodoro'
import type { PomodoroPhase } from './components/Pomodoro'
import { useStopwatch } from './components/Stopwatch'
import { Sidebar } from './components/Sidebar'
import type { ActiveMode } from './components/Sidebar'
import { TimerDisplay } from './components/TimerDisplay'
import { StopwatchDisplay } from './components/StopwatchDisplay'
import { 
  GM_MESSAGES, 
  POMODORO_WORK_MESSAGES, 
  POMODORO_BREAK_MESSAGES, 
  STOPWATCH_MESSAGES,
} from './messages'

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

// Stopwatch gradient
const STOPWATCH_GRADIENT: GradientColors = [GRUVBOX.aqua, GRUVBOX.aquaLight, GRUVBOX.blue, GRUVBOX.blueLight]

const TRANSITION_DURATION = 3000

function App() {
  const [targetState, setTargetState] = useState<FaceState>('awake')
  const [displayState, setDisplayState] = useState<FaceState>('awake')
  const [activeMode, setActiveMode] = useState<ActiveMode>('none')
  const [time, setTime] = useState(new Date())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gradientRef = useRef<Gradient | null>(null)
  const faceTimeoutRef = useRef<number | null>(null)
  const demoIntervalRef = useRef<number | null>(null)

  // Pomodoro state
  const pomodoro = usePomodoro({
    onPhaseChange: (phase) => {
      if (gradientRef.current && activeMode === 'pomodoro') {
        gradientRef.current.setColors(POMODORO_GRADIENTS[phase], TRANSITION_DURATION)
      }
    },
    onClose: () => {
      setActiveMode('none')
      startDemoMode()
    },
  })

  // Stopwatch state
  const stopwatch = useStopwatch()

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Get ticker messages based on mode
  const getTickerMessages = () => {
    if (activeMode === 'pomodoro') {
      return pomodoro.phase === 'work' ? POMODORO_WORK_MESSAGES : POMODORO_BREAK_MESSAGES
    }
    if (activeMode === 'stopwatch') {
      return STOPWATCH_MESSAGES
    }
    return GM_MESSAGES
  }

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

  // Update gradient colors when target state changes (only when in demo mode)
  useEffect(() => {
    if (activeMode !== 'none') return
    
    if (gradientRef.current) {
      const colors = STATE_GRADIENTS[targetState]
      gradientRef.current.setColors(colors, TRANSITION_DURATION)
    }
    
    if (faceTimeoutRef.current) {
      clearTimeout(faceTimeoutRef.current)
    }
    
    faceTimeoutRef.current = window.setTimeout(() => {
      setDisplayState(targetState)
    }, TRANSITION_DURATION)
    
    return () => {
      if (faceTimeoutRef.current) {
        clearTimeout(faceTimeoutRef.current)
      }
    }
  }, [targetState, activeMode])

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

  // Stop demo mode when any mode becomes active
  useEffect(() => {
    if (activeMode !== 'none' && demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
  }, [activeMode])

  const handleStartPomodoro = () => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
    setActiveMode('pomodoro')
    pomodoro.start()
  }

  const handleStartStopwatch = () => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current)
      demoIntervalRef.current = null
    }
    setActiveMode('stopwatch')
    stopwatch.start()
    if (gradientRef.current) {
      gradientRef.current.setColors(STOPWATCH_GRADIENT, TRANSITION_DURATION)
    }
  }

  const handleStopwatchClose = () => {
    stopwatch.close()
    setActiveMode('none')
    startDemoMode()
  }

  const handlePomodoroClose = () => {
    pomodoro.close()
    setActiveMode('none')
    startDemoMode()
  }

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const getStateLabel = () => {
    if (activeMode === 'pomodoro') {
      return pomodoro.phase === 'work' ? 'FOCUS' : 'BREAK'
    }
    if (activeMode === 'stopwatch') {
      return 'STOPWATCH'
    }
    return {
      awake: 'Ready',
      working: 'Working...',
      sleeping: 'Zzz...',
      attention: 'Hey!',
      done: 'Done!',
    }[displayState]
  }

  const getCurrentColors = (): GradientColors => {
    if (activeMode === 'pomodoro') {
      return POMODORO_GRADIENTS[pomodoro.phase]
    }
    if (activeMode === 'stopwatch') {
      return STOPWATCH_GRADIENT
    }
    return STATE_GRADIENTS[targetState]
  }

  const currentColors = getCurrentColors()

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

      {/* Time - always top left */}
      <div className="absolute top-2 left-2 z-20 text-xs text-white/70">
        {formattedTime}
      </div>

      {/* Main content - 75% height */}
      <div className="relative z-10 flex-1" style={{ height: '75%' }}>
        {/* Left Sidebar - absolute positioned */}
        <div className="absolute left-0 top-0 bottom-0 z-20" style={{ width: '20%' }}>
          <Sidebar
            activeMode={activeMode}
            pomodoroPaused={pomodoro.isPaused}
            stopwatchPaused={stopwatch.isPaused}
            onStartPomodoro={handleStartPomodoro}
            onStartStopwatch={handleStartStopwatch}
            onPomodoroPause={pomodoro.pause}
            onPomodoroSkip={pomodoro.skip}
            onPomodoroReset={pomodoro.reset}
            onPomodoroClose={handlePomodoroClose}
            onStopwatchPause={stopwatch.pause}
            onStopwatchLap={stopwatch.lap}
            onStopwatchClose={handleStopwatchClose}
          />
        </div>

        {/* Main area - full width, content centered */}
        <div className="w-full h-full relative">
          {/* State label - always top right */}
          <div className="absolute top-2 right-2 text-xs uppercase tracking-wider text-white/50 z-10">
            {getStateLabel()}
          </div>
          
          {/* Face - animates between center and top-right */}
          <div 
            className="absolute transition-all duration-700 ease-in-out"
            style={activeMode !== 'none' ? {
              // Top right position (below label)
              top: '1.5rem',
              right: '0.5rem',
              transform: 'scale(0.8)',
            } : {
              // Centered position
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(1)',
            }}
          >
            <AsciiFace state={activeMode !== 'none' ? 'working' : displayState} size="small" />
          </div>
          
          {/* Timer/Stopwatch - fades in when active */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
              activeMode !== 'none' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {activeMode === 'pomodoro' ? (
              <TimerDisplay
                timeRemaining={pomodoro.timeRemaining}
                phase={pomodoro.phase}
                isPaused={pomodoro.isPaused}
              />
            ) : activeMode === 'stopwatch' ? (
              <StopwatchDisplay
                elapsedTime={stopwatch.elapsedTime}
                currentLapTime={stopwatch.currentLapTime}
                laps={stopwatch.laps}
                isPaused={stopwatch.isPaused}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Scrolling ticker - 25% height */}
      <div className="relative z-10" style={{ height: '25%' }}>
        <ScrollingTicker messages={getTickerMessages()} speed={8} />
      </div>
    </div>
  )
}

export default App
