export type FaceState = 'awake' | 'working' | 'sleeping' | 'attention' | 'done'

interface AsciiFaceProps {
  state: FaceState
}

const FACES: Record<FaceState, string[]> = {
  awake: [
    '  ✨     ✨  ',
    '             ',
    '     ‿‿     ',
  ],
  working: [
    '  ◉      ◉  ',
    '             ',
    '     ━━     ',
  ],
  sleeping: [
    '  —      —  ',
    '             ',
    '     ～     ',
  ],
  attention: [
    '  ◎      ◎  ',
    '             ',
    '     ○      ',
  ],
  done: [
    '  ✨     ✨  ',
    '             ',
    '    ╰‿╯    ',
  ],
}

export function AsciiFace({ state }: AsciiFaceProps) {
  const face = FACES[state]

  return (
    <pre 
      className="font-mono text-4xl md:text-6xl leading-relaxed select-none"
      style={{ 
        color: 'rgba(255, 255, 255, 0.95)',
        textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
        letterSpacing: '0.1em',
      }}
    >
      {face.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </pre>
  )
}
