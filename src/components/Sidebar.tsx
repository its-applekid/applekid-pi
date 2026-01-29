import { useState } from 'react'
import { 
  Apple, 
  Timer, 
  Pause, 
  Play, 
  SkipForward, 
  RotateCcw, 
  X,
  Flag,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

export type ActiveMode = 'none' | 'pomodoro' | 'stopwatch'

interface IconButtonProps {
  onClick: () => void
  title: string
  children: React.ReactNode
}

function IconButton({ onClick, title, children }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full h-12 flex items-center justify-center rounded-lg bg-black/20 hover:bg-black/30 active:bg-black/40 transition-colors"
      title={title}
    >
      {children}
    </button>
  )
}

interface SidebarProps {
  activeMode: ActiveMode
  pomodoroPaused: boolean
  stopwatchPaused: boolean
  onStartPomodoro: () => void
  onStartStopwatch: () => void
  onPomodoroPause: () => void
  onPomodoroSkip: () => void
  onPomodoroReset: () => void
  onPomodoroClose: () => void
  onStopwatchPause: () => void
  onStopwatchLap: () => void
  onStopwatchClose: () => void
}

// Define icon sets for each mode
type IconItem = {
  icon: React.ReactNode
  onClick: () => void
  title: string
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
  const [scrollOffset, setScrollOffset] = useState(0)
  const iconSize = 24
  const strokeWidth = 1.5

  // Build icon list based on mode
  const getIcons = (): IconItem[] => {
    if (activeMode === 'none') {
      return [
        { 
          icon: <Apple size={iconSize} strokeWidth={strokeWidth} />, 
          onClick: onStartPomodoro, 
          title: 'Start Pomodoro' 
        },
        { 
          icon: <Timer size={iconSize} strokeWidth={strokeWidth} />, 
          onClick: onStartStopwatch, 
          title: 'Start Stopwatch' 
        },
      ]
    }

    if (activeMode === 'pomodoro') {
      return [
        { 
          icon: pomodoroPaused 
            ? <Play size={iconSize} strokeWidth={strokeWidth} /> 
            : <Pause size={iconSize} strokeWidth={strokeWidth} />, 
          onClick: onPomodoroPause, 
          title: pomodoroPaused ? 'Resume' : 'Pause' 
        },
        { 
          icon: <SkipForward size={iconSize} strokeWidth={strokeWidth} />, 
          onClick: onPomodoroSkip, 
          title: 'Skip to next phase' 
        },
        { 
          icon: <RotateCcw size={iconSize} strokeWidth={strokeWidth} />, 
          onClick: onPomodoroReset, 
          title: 'Reset to beginning' 
        },
        { 
          icon: <X size={iconSize} strokeWidth={strokeWidth} />, 
          onClick: onPomodoroClose, 
          title: 'End pomodoro' 
        },
      ]
    }

    if (activeMode === 'stopwatch') {
      return [
        { 
          icon: stopwatchPaused 
            ? <Play size={iconSize} strokeWidth={strokeWidth} /> 
            : <Pause size={iconSize} strokeWidth={strokeWidth} />, 
          onClick: onStopwatchPause, 
          title: stopwatchPaused ? 'Resume' : 'Pause' 
        },
        { 
          icon: <Flag size={iconSize} strokeWidth={strokeWidth} />, 
          onClick: onStopwatchLap, 
          title: 'Lap' 
        },
        { 
          icon: <X size={iconSize} strokeWidth={strokeWidth} />, 
          onClick: onStopwatchClose, 
          title: 'Close stopwatch' 
        },
      ]
    }

    return []
  }

  const allIcons = getIcons()
  const maxVisible = 4
  const needsPagination = allIcons.length > maxVisible
  const canScrollUp = scrollOffset > 0
  const canScrollDown = scrollOffset + maxVisible < allIcons.length

  // Get visible icons (accounting for navigation arrows taking slots)
  const getVisibleIcons = () => {
    if (!needsPagination) return allIcons
    
    const availableSlots = maxVisible - (canScrollUp ? 1 : 0) - (canScrollDown ? 1 : 0)
    return allIcons.slice(scrollOffset, scrollOffset + availableSlots)
  }

  const visibleIcons = getVisibleIcons()

  const scrollUp = () => setScrollOffset(prev => Math.max(0, prev - 1))
  const scrollDown = () => setScrollOffset(prev => Math.min(allIcons.length - maxVisible + 1, prev + 1))

  return (
    <div className="h-full flex flex-col justify-center items-stretch gap-2 px-2 pl-2 text-white/90 border-l border-white/10">
      {/* Up arrow if needed */}
      {needsPagination && canScrollUp && (
        <IconButton onClick={scrollUp} title="Scroll up">
          <ChevronUp size={iconSize} strokeWidth={strokeWidth} />
        </IconButton>
      )}

      {/* Visible icons */}
      {visibleIcons.map((item, index) => (
        <IconButton key={index} onClick={item.onClick} title={item.title}>
          {item.icon}
        </IconButton>
      ))}

      {/* Down arrow if needed */}
      {needsPagination && canScrollDown && (
        <IconButton onClick={scrollDown} title="Scroll down">
          <ChevronDown size={iconSize} strokeWidth={strokeWidth} />
        </IconButton>
      )}
    </div>
  )
}
