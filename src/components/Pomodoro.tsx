import { useState, useEffect, useCallback, useRef } from 'react'

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'

interface PomodoroState {
  isActive: boolean
  isPaused: boolean
  phase: PomodoroPhase
  phaseIndex: number
  timeRemaining: number // in seconds
}

// Phase durations in seconds
const PHASE_DURATIONS: Record<PomodoroPhase, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 35 * 60,
}

// Cycle: work, short, work, short, work, long
const PHASE_SEQUENCE: PomodoroPhase[] = [
  'work', 'shortBreak', 'work', 'shortBreak', 'work', 'longBreak'
]

interface PomodoroProps {
  onPhaseChange?: (phase: PomodoroPhase) => void
  onClose?: () => void
}

export function usePomodoro({ onPhaseChange, onClose }: PomodoroProps = {}) {
  const [state, setState] = useState<PomodoroState>({
    isActive: false,
    isPaused: false,
    phase: 'work',
    phaseIndex: 0,
    timeRemaining: PHASE_DURATIONS.work,
  })

  // Track timing with refs for accuracy
  const phaseStartTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)
  const totalPausedTimeRef = useRef<number>(0)

  // Timer tick - use requestAnimationFrame for smooth updates
  useEffect(() => {
    if (!state.isActive || state.isPaused) return

    let animationId: number

    const tick = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - phaseStartTimeRef.current - totalPausedTimeRef.current) / 1000)
      const phaseDuration = PHASE_DURATIONS[state.phase]
      const remaining = Math.max(0, phaseDuration - elapsed)

      if (remaining <= 0) {
        // Move to next phase
        const nextIndex = (state.phaseIndex + 1) % PHASE_SEQUENCE.length
        const nextPhase = PHASE_SEQUENCE[nextIndex]
        
        // Reset timing for new phase
        phaseStartTimeRef.current = Date.now()
        totalPausedTimeRef.current = 0
        
        setState(prev => ({
          ...prev,
          phaseIndex: nextIndex,
          phase: nextPhase,
          timeRemaining: PHASE_DURATIONS[nextPhase],
        }))
        onPhaseChange?.(nextPhase)
      } else {
        setState(prev => ({ ...prev, timeRemaining: remaining }))
      }

      animationId = requestAnimationFrame(tick)
    }

    animationId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(animationId)
  }, [state.isActive, state.isPaused, state.phase, state.phaseIndex, onPhaseChange])

  // Notify phase change on start
  useEffect(() => {
    if (state.isActive) {
      onPhaseChange?.(state.phase)
    }
  }, [state.isActive])

  const start = useCallback(() => {
    phaseStartTimeRef.current = Date.now()
    totalPausedTimeRef.current = 0
    setState(prev => ({ ...prev, isActive: true, isPaused: false }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => {
      if (prev.isPaused) {
        // Resuming - add paused duration to total
        totalPausedTimeRef.current += Date.now() - pausedAtRef.current
        return { ...prev, isPaused: false }
      } else {
        // Pausing - record when we paused
        pausedAtRef.current = Date.now()
        return { ...prev, isPaused: true }
      }
    })
  }, [])

  const skip = useCallback(() => {
    const nextIndex = (state.phaseIndex + 1) % PHASE_SEQUENCE.length
    const nextPhase = PHASE_SEQUENCE[nextIndex]
    
    // Reset timing for new phase
    phaseStartTimeRef.current = Date.now()
    totalPausedTimeRef.current = 0
    
    setState(prev => ({
      ...prev,
      phaseIndex: nextIndex,
      phase: nextPhase,
      timeRemaining: PHASE_DURATIONS[nextPhase],
    }))
    onPhaseChange?.(nextPhase)
  }, [state.phaseIndex, onPhaseChange])

  const reset = useCallback(() => {
    const phase = PHASE_SEQUENCE[0]
    phaseStartTimeRef.current = Date.now()
    totalPausedTimeRef.current = 0
    
    onPhaseChange?.(phase)
    setState({
      isActive: true,
      isPaused: false,
      phase,
      phaseIndex: 0,
      timeRemaining: PHASE_DURATIONS[phase],
    })
  }, [onPhaseChange])

  const close = useCallback(() => {
    setState({
      isActive: false,
      isPaused: false,
      phase: 'work',
      phaseIndex: 0,
      timeRemaining: PHASE_DURATIONS.work,
    })
    onClose?.()
  }, [onClose])

  return {
    ...state,
    start,
    pause,
    skip,
    reset,
    close,
  }
}

// Format seconds to MM:SS
export function formatTime(seconds: number): { minutes: string; seconds: string } {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return {
    minutes: mins.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0'),
  }
}
