import { useState, useEffect, useCallback, useRef } from 'react'

interface Lap {
  lapNumber: number
  lapTime: number      // Time for this lap segment
  totalTime: number    // Total elapsed time at lap
}

interface StopwatchState {
  isActive: boolean
  isPaused: boolean
  elapsedTime: number  // in milliseconds
  laps: Lap[]
  lastLapTime: number  // Time when last lap was recorded
}

export function useStopwatch() {
  const [state, setState] = useState<StopwatchState>({
    isActive: false,
    isPaused: false,
    elapsedTime: 0,
    laps: [],
    lastLapTime: 0,
  })
  
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  // Timer tick
  useEffect(() => {
    if (!state.isActive || state.isPaused) return

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = pausedTimeRef.current + (now - startTimeRef.current)
      setState(prev => ({ ...prev, elapsedTime: elapsed }))
    }, 10) // Update every 10ms for smooth display

    return () => clearInterval(interval)
  }, [state.isActive, state.isPaused])

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    pausedTimeRef.current = 0
    setState(prev => ({ 
      ...prev, 
      isActive: true, 
      isPaused: false,
      elapsedTime: 0,
      laps: [],
      lastLapTime: 0,
    }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => {
      if (prev.isPaused) {
        // Resuming
        startTimeRef.current = Date.now()
        return { ...prev, isPaused: false }
      } else {
        // Pausing
        pausedTimeRef.current = prev.elapsedTime
        return { ...prev, isPaused: true }
      }
    })
  }, [])

  const lap = useCallback(() => {
    setState(prev => {
      const lapTime = prev.elapsedTime - prev.lastLapTime
      const newLap: Lap = {
        lapNumber: prev.laps.length + 1,
        lapTime,
        totalTime: prev.elapsedTime,
      }
      return {
        ...prev,
        laps: [...prev.laps, newLap],
        lastLapTime: prev.elapsedTime,
      }
    })
  }, [])

  const close = useCallback(() => {
    setState({
      isActive: false,
      isPaused: false,
      elapsedTime: 0,
      laps: [],
      lastLapTime: 0,
    })
  }, [])

  return {
    ...state,
    currentLapTime: state.elapsedTime - state.lastLapTime,
    start,
    pause,
    lap,
    close,
  }
}

// Format milliseconds to MM:SS.cc
export function formatStopwatchTime(ms: number): { minutes: string; seconds: string; centis: string } {
  const totalSeconds = Math.floor(ms / 1000)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  const centis = Math.floor((ms % 1000) / 10)
  
  return {
    minutes: mins.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0'),
    centis: centis.toString().padStart(2, '0'),
  }
}
