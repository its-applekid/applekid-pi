import { useRef, useEffect, useState } from 'react'

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
  const lastMessageRef = useRef(currentMessage)

  // Pick a new random message (different from last)
  const pickNewMessage = () => {
    if (messages.length <= 1) {
      return messages[0] || ''
    }
    let newMessage: string
    do {
      newMessage = messages[Math.floor(Math.random() * messages.length)]
    } while (newMessage === lastMessageRef.current && messages.length > 1)
    lastMessageRef.current = newMessage
    return newMessage
  }

  // Update message when messages array changes
  useEffect(() => {
    const newMsg = pickNewMessage()
    setCurrentMessage(newMsg)
    setAnimationKey(prev => prev + 1)
  }, [messages])

  // Timer to change message after each scroll cycle
  useEffect(() => {
    const interval = setInterval(() => {
      const newMsg = pickNewMessage()
      setCurrentMessage(newMsg)
      setAnimationKey(prev => prev + 1)
    }, speed * 1000) // Match animation duration

    return () => clearInterval(interval)
  }, [speed, messages])

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
          animation: `ticker-scroll ${speed}s linear`,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '3.5rem',
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
        }}
      >
        {currentMessage}
      </div>
    </div>
  )
}
