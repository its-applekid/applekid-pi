import { formatStopwatchTime } from './Stopwatch'

interface Lap {
  lapNumber: number
  lapTime: number
  totalTime: number
}

interface StopwatchDisplayProps {
  elapsedTime: number
  currentLapTime: number
  laps: Lap[]
  isPaused: boolean
}

export function StopwatchDisplay({ elapsedTime, currentLapTime, laps, isPaused }: StopwatchDisplayProps) {
  const time = formatStopwatchTime(elapsedTime)
  const lapTime = formatStopwatchTime(currentLapTime)
  
  // Get last lap to display
  const lastLap = laps.length > 0 ? laps[laps.length - 1] : null
  
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      {/* Main timer */}
      <div 
        className={`font-pressstart text-3xl md:text-4xl text-white ${isPaused ? 'animate-pulse' : ''}`}
        style={{
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        <span>{time.minutes}</span>
        <span>:</span>
        <span>{time.seconds}</span>
        <span className="text-xl">.</span>
        <span className="text-xl">{time.centis}</span>
      </div>
      
      {/* Current lap time (smaller) */}
      {laps.length > 0 && (
        <div 
          className="text-sm text-white/70 font-mono"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          Lap {laps.length + 1}: {lapTime.minutes}:{lapTime.seconds}
        </div>
      )}
      
      {/* Last lap display */}
      {lastLap && (
        <div className="text-xs text-white/50 mt-1">
          Lap {lastLap.lapNumber}: {formatStopwatchTime(lastLap.lapTime).minutes}:{formatStopwatchTime(lastLap.lapTime).seconds}.{formatStopwatchTime(lastLap.lapTime).centis}
        </div>
      )}
      
      {/* Paused indicator */}
      {isPaused && (
        <div className="text-xs uppercase tracking-wider text-white/50 animate-pulse mt-1">
          PAUSED
        </div>
      )}
    </div>
  )
}
