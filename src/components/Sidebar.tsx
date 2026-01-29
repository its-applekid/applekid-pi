export type ActiveMode = 'none' | 'pomodoro' | 'stopwatch'

interface SidebarProps {
  activeMode: ActiveMode
  pomodoroPaused: boolean
  stopwatchPaused: boolean
  onStartPomodoro: () => void
  onStartStopwatch: () => void
  // Pomodoro controls
  onPomodoroPause: () => void
  onPomodoroSkip: () => void
  onPomodoroReset: () => void
  onPomodoroClose: () => void
  // Stopwatch controls
  onStopwatchPause: () => void
  onStopwatchLap: () => void
  onStopwatchClose: () => void
}

// Icons
const AppleIcon = () => (
  <span className="text-xl" role="img" aria-label="pomodoro">🍎</span>
)

const StopwatchIcon = () => (
  <span className="text-xl" role="img" aria-label="stopwatch">⏱</span>
)

const PauseIcon = () => (
  <span className="text-base">⏸</span>
)

const PlayIcon = () => (
  <span className="text-base">▶</span>
)

const SkipIcon = () => (
  <span className="text-base">⏭</span>
)

const ResetIcon = () => (
  <span className="text-base">↺</span>
)

const CloseIcon = () => (
  <span className="text-base">✕</span>
)

const LapIcon = () => (
  <span className="text-base">🏁</span>
)

function IconButton({ 
  onClick, 
  title, 
  children 
}: { 
  onClick: () => void
  title: string
  children: React.ReactNode 
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
      title={title}
    >
      {children}
    </button>
  )
}

export function Sidebar({
  activeMode,
  pomodoroPaused,
  stopwatchPaused,
  onStartPomodoro,
  onStartStopwatch,
  onPomodoroPause,
  onPomodoroSkip,
  onPomodoroReset,
  onPomodoroClose,
  onStopwatchPause,
  onStopwatchLap,
  onStopwatchClose,
}: SidebarProps) {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-2 px-1">
      {activeMode === 'none' && (
        // Mode selection buttons
        <>
          <IconButton onClick={onStartPomodoro} title="Start Pomodoro">
            <AppleIcon />
          </IconButton>
          <IconButton onClick={onStartStopwatch} title="Start Stopwatch">
            <StopwatchIcon />
          </IconButton>
        </>
      )}
      
      {activeMode === 'pomodoro' && (
        // Pomodoro controls
        <>
          <IconButton 
            onClick={onPomodoroPause} 
            title={pomodoroPaused ? "Resume" : "Pause"}
          >
            {pomodoroPaused ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
          <IconButton onClick={onPomodoroSkip} title="Skip to next phase">
            <SkipIcon />
          </IconButton>
          <IconButton onClick={onPomodoroReset} title="Reset to beginning">
            <ResetIcon />
          </IconButton>
          <IconButton onClick={onPomodoroClose} title="End pomodoro">
            <CloseIcon />
          </IconButton>
        </>
      )}
      
      {activeMode === 'stopwatch' && (
        // Stopwatch controls
        <>
          <IconButton 
            onClick={onStopwatchPause} 
            title={stopwatchPaused ? "Resume" : "Pause"}
          >
            {stopwatchPaused ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
          <IconButton onClick={onStopwatchLap} title="Lap">
            <LapIcon />
          </IconButton>
          <IconButton onClick={onStopwatchClose} title="Close stopwatch">
            <CloseIcon />
          </IconButton>
        </>
      )}
    </div>
  )
}
