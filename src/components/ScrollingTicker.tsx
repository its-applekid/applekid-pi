import { useRef, useEffect, useState, useCallback } from 'react'

interface ScrollingTickerProps {
  messages: string[]
  speed?: number
}

export function ScrollingTicker({ messages, speed = 10 }: ScrollingTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentMessage, setCurrentMessage] = useState(() => 
    messages[Math.floor(Math.random() * messages.length)]
  )
  const [animationKey, setAnimationKey] = useState(0)

  // Pick a new random message (different from current)
  const pickNewMessage = useCallback(() => {
    if (messages.length <= 1) {
      setCurrentMessage(messages[0] || '')
      return
    }
    let newMessage: string
    do {
      newMessage = messages[Math.floor(Math.random() * messages.length)]
    } while (newMessage === currentMessage && messages.length > 1)
    setCurrentMessage(newMessage)
    setAnimationKey(prev => prev + 1)
  }, [messages, currentMessage])

  // Update message when messages array changes
  useEffect(() => {
    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)])
    setAnimationKey(prev => prev + 1)
  }, [messages])

  // Handle animation end - pick new message
  const handleAnimationIteration = useCallback(() => {
    pickNewMessage()
  }, [pickNewMessage])

  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({})

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
      <div 
        ref={contentRef}
        key={animationKey}
        className="ticker-content whitespace-nowrap"
        style={{ 
          ...animationStyle,
          animation: `ticker-scroll ${speed}s linear infinite`,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '2rem',
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
        }}
        onAnimationIteration={handleAnimationIteration}
      >
        {currentMessage}
      </div>
    </div>
  )
}
