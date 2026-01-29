import { useRef, useEffect, useState } from 'react'

interface ScrollingTickerProps {
  message: string
  speed?: number
}

// Pre-rendered ASCII art for common messages
// Using solid block style
const ASCII_CHARS: Record<string, string[]> = {
  'G': [
    ' █████ ',
    '██   ██',
    '██     ',
    '██  ███',
    '██   ██',
    ' █████ ',
  ],
  'M': [
    '███   ███',
    '████ ████',
    '██ ███ ██',
    '██  █  ██',
    '██     ██',
    '██     ██',
  ],
  ' ': [
    '   ',
    '   ',
    '   ',
    '   ',
    '   ',
    '   ',
  ],
  '!': [
    '██',
    '██',
    '██',
    '██',
    '  ',
    '██',
  ],
}

function textToAscii(text: string): string[] {
  const upperText = text.toUpperCase()
  const lines: string[] = ['', '', '', '', '', '']
  
  for (const char of upperText) {
    const charArt = ASCII_CHARS[char] || ASCII_CHARS[' ']
    for (let i = 0; i < 6; i++) {
      lines[i] += (charArt[i] || '') + ' '
    }
  }
  
  return lines
}

export function ScrollingTicker({ message, speed = 10 }: ScrollingTickerProps) {
  const asciiLines = textToAscii(message)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const contentWidth = contentRef.current.offsetWidth
      
      // Start from right edge of container, end when fully off left
      const startX = containerWidth
      const endX = -contentWidth
      
      setAnimationStyle({
        transform: `translateX(${startX}px)`,
        animation: `ticker-scroll ${speed}s linear infinite`,
        // Use CSS custom properties for dynamic animation
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
        className="ticker-content whitespace-nowrap font-mono text-xs leading-none"
        style={{ 
          ...animationStyle,
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
        }}
      >
        <pre className="inline-block leading-none">
          {asciiLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </pre>
      </div>
    </div>
  )
}
