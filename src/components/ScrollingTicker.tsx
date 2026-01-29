import { useRef, useEffect, useState } from 'react'

interface ScrollingTickerProps {
  message: string
  speed?: number
}

export function ScrollingTicker({ message, speed = 10 }: ScrollingTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const contentWidth = contentRef.current.offsetWidth
      
      const startX = containerWidth
      const endX = -contentWidth
      
      setAnimationStyle({
        transform: `translateX(${startX}px)`,
        animation: `ticker-scroll ${speed}s linear infinite`,
        ['--start-x' as string]: `${startX}px`,
        ['--end-x' as string]: `${endX}px`,
      })
    }
  }, [speed, message])
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-black/20 flex items-center"
    >
      <div 
        ref={contentRef}
        className="ticker-content whitespace-nowrap"
        style={{ 
          ...animationStyle,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '2rem',
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
        }}
      >
        {message}
      </div>
    </div>
  )
}
