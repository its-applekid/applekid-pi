interface SidebarProps {
  pomodoroActive: boolean
  pomodoroPaused: boolean
  onStartPomodoro: () => void
  onPause: () => void
  onSkip: () => void
  onReset: () => void
  onClose: () => void
}

// Apple emoji/icon for pomodoro
const AppleIcon = () => (
  <span className="text-2xl" role="img" aria-label="pomodoro">🍎</span>
)

// Control icons
const PauseIcon = () => (
  <span className="text-lg">⏸</span>
)

const PlayIcon = () => (
  <span className="text-lg">▶</span>
)

const SkipIcon = () => (
  <span className="text-lg">⏭</span>
)

const ResetIcon = () => (
  <span className="text-lg">↺</span>
)

const CloseIcon = () => (
  <span className="text-lg">✕</span>
)

export function Sidebar({
  pomodoroActive,
  pomodoroPaused,
  onStartPomodoro,
  onPause,
  onSkip,
  onReset,
  onClose,
}: SidebarProps) {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-3 px-2">
      {!pomodoroActive ? (
        // Start pomodoro button
        <button
          onClick={onStartPomodoro}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
          title="Start Pomodoro"
        >
          <AppleIcon />
        </button>
      ) : (
        // Pomodoro controls
        <>
          <button
            onClick={onPause}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
            title={pomodoroPaused ? "Resume" : "Pause"}
          >
            {pomodoroPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
          <button
            onClick={onSkip}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
            title="Skip to next phase"
          >
            <SkipIcon />
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
            title="Reset to beginning"
          >
            <ResetIcon />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
            title="End pomodoro"
          >
            <CloseIcon />
          </button>
        </>
      )}
    </div>
  )
}
