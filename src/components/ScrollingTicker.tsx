interface ScrollingTickerProps {
  message: string
  speed?: number
}

// Pre-rendered ASCII art for common messages
// Using a simplified block style that looks good at small sizes
const ASCII_CHARS: Record<string, string[]> = {
  'G': [
    ' █████ ',
    '██░░░██',
    '██     ',
    '██  ███',
    '██   ██',
    '░█████ ',
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
  
  return (
    <div className="w-full h-full overflow-hidden bg-black/20 flex items-center">
      <div 
        className="animate-scroll whitespace-nowrap font-mono text-sm leading-tight"
        style={{ 
          animationDuration: `${speed}s`,
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
        }}
      >
        <pre className="inline-block">
          {asciiLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </pre>
      </div>
    </div>
  )
}
