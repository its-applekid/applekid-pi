export type FaceState = 'awake' | 'working' | 'sleeping' | 'attention' | 'done'

interface SunnyFaceProps {
  state: FaceState
  size?: number
}

export function SunnyFace({ state, size = 200 }: SunnyFaceProps) {
  const stateConfig = {
    awake: { 
      bodyClass: '', 
      eyes: 'sparkle',
      mouth: 'smile',
    },
    working: { 
      bodyClass: 'animate-pulse-subtle', 
      eyes: 'sparkle',
      mouth: 'determined',
    },
    sleeping: { 
      bodyClass: 'opacity-60', 
      eyes: 'closed',
      mouth: 'peaceful',
    },
    attention: { 
      bodyClass: '', 
      eyes: 'wide',
      mouth: 'open',
    },
    done: { 
      bodyClass: '', 
      eyes: 'sparkle',
      mouth: 'big-smile',
    },
  }

  const config = stateConfig[state]

  return (
    <div 
      className={`relative ${config.bodyClass}`}
      style={{ width: size, height: size }}
    >
      {/* Spiky body */}
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(255, 4, 32, 0.3))' }}
      >
        {/* Generate spiky circle */}
        <path
          d={generateSpikyPath(100, 100, 70, 90, 32)}
          fill="#FF0420"
        />
      </svg>

      {/* Face elements */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ paddingTop: size * 0.1 }}
      >
        {/* Eyes */}
        <div 
          className="flex gap-8 mb-2"
          style={{ gap: size * 0.15 }}
        >
          <Eye type={config.eyes} size={size * 0.12} />
          <Eye type={config.eyes} size={size * 0.12} />
        </div>

        {/* Mouth */}
        <Mouth type={config.mouth} size={size * 0.15} />
      </div>
    </div>
  )
}

function Eye({ type, size }: { type: string; size: number }) {
  if (type === 'sparkle') {
    return (
      <div className="animate-blink" style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
            fill="white"
          />
        </svg>
      </div>
    )
  }
  
  if (type === 'closed') {
    return (
      <div 
        className="bg-white rounded-full"
        style={{ width: size, height: size * 0.2 }}
      />
    )
  }
  
  if (type === 'wide') {
    return (
      <div 
        className="bg-white rounded-full"
        style={{ width: size, height: size }}
      />
    )
  }

  return null
}

function Mouth({ type, size }: { type: string; size: number }) {
  if (type === 'smile' || type === 'determined') {
    return (
      <div style={{ width: size, height: size * 0.5 }}>
        <svg viewBox="0 0 30 15" className="w-full h-full">
          <path
            d="M5 5 Q15 15 25 5"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  if (type === 'peaceful') {
    return (
      <div style={{ width: size * 0.8, height: size * 0.3 }}>
        <svg viewBox="0 0 24 8" className="w-full h-full">
          <path
            d="M4 4 Q12 8 20 4"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  if (type === 'big-smile') {
    return (
      <div style={{ width: size * 1.2, height: size * 0.7 }}>
        <svg viewBox="0 0 36 20" className="w-full h-full">
          <path
            d="M4 4 Q18 24 32 4"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  if (type === 'open') {
    return (
      <div 
        className="bg-white rounded-full"
        style={{ width: size * 0.5, height: size * 0.5 }}
      />
    )
  }

  return null
}

// Generate spiky circle path
function generateSpikyPath(
  cx: number, 
  cy: number, 
  innerRadius: number, 
  outerRadius: number, 
  spikes: number
): string {
  const points: string[] = []
  const angleStep = (Math.PI * 2) / spikes

  for (let i = 0; i < spikes; i++) {
    // Outer point (spike tip)
    const outerAngle = angleStep * i - Math.PI / 2
    const outerX = cx + Math.cos(outerAngle) * outerRadius
    const outerY = cy + Math.sin(outerAngle) * outerRadius
    points.push(`${outerX},${outerY}`)

    // Inner point (between spikes)
    const innerAngle = angleStep * (i + 0.5) - Math.PI / 2
    const innerX = cx + Math.cos(innerAngle) * innerRadius
    const innerY = cy + Math.sin(innerAngle) * innerRadius
    points.push(`${innerX},${innerY}`)
  }

  return `M${points.join(' L')} Z`
}
