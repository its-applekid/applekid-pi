import { useRef, useEffect, useState } from 'react'
import { shuffleArray } from '../messages'

interface ScrollingTickerProps {
  messages: string[]
  speed?: number
  gapSeconds?: number
}

export function ScrollingTicker({ messages, speed = 10, gapSeconds = 15 }: ScrollingTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Shuffle messages and track current index
  const [shuffledMessages, setShuffledMessages] = useState<string[]>(() => shuffleArray(messages))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const [isWaiting, setIsWaiting] = useState(false)

  // Reshuffle when messages array changes
  useEffect(() => {
    setShuffledMessages(shuffleArray(messages))
    setCurrentIndex(0)
    setAnimationKey(prev => prev + 1)
    setIsWaiting(false)
  }, [messages])

  // Timer to advance to next message (with gap)
  useEffect(() => {
    if (isWaiting) {
      // During gap, wait then show next message
      const gapTimer = setTimeout(() => {
        setCurrentIndex(prev => {
          const nextIndex = prev + 1
          if (nextIndex >= shuffledMessages.length) {
            setShuffledMessages(shuffleArray(messages))
            return 0
          }
          return nextIndex
        })
        setAnimationKey(prev => prev + 1)
        setIsWaiting(false)
      }, gapSeconds * 1000)

      return () => clearTimeout(gapTimer)
    } else {
      // During scroll, wait for animation to finish then enter gap
      const scrollTimer = setTimeout(() => {
        setIsWaiting(true)
      }, speed * 1000)

      return () => clearTimeout(scrollTimer)
    }
  }, [isWaiting, speed, gapSeconds, messages, shuffledMessages.length, animationKey])

  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({})
  const currentMessage = shuffledMessages[currentIndex] || messages[0] || ''

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const contentWidth = contentRef.current.offsetWidth
      
      const startX = containerWidth
      const endX = -contentWidth
      
      setAnimationStyle({
        ['--start-x' as string]: `${startX}px`,
        ['--end-x' as string]: `${endX}px`,
      })
    }
  }, [currentMessage, animationKey])
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-black/20 flex items-center"
    >
      {!isWaiting && (
        <div 
          ref={contentRef}
          key={animationKey}
          className="ticker-content whitespace-nowrap"
          style={{ 
            ...animationStyle,
            animation: `ticker-scroll ${speed}s linear`,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '3.5rem',
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
          }}
        >
          {currentMessage}
        </div>
      )}
    </div>
  )
}
