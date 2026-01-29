export type FaceState = 'awake' | 'working' | 'sleeping' | 'attention' | 'done'

interface AsciiFaceProps {
  state: FaceState
  size?: 'small' | 'large'
}

const FACES: Record<FaceState, string[]> = {
  awake: [
    '✨  ✨',
    '      ',
    ' ‿‿ ',
  ],
  working: [
    '◉   ◉',
    '      ',
    '  ━━  ',
  ],
  sleeping: [
    '—   —',
    '      ',
    '  ～  ',
  ],
  attention: [
    '◎   ◎',
    '      ',
    '  ○   ',
  ],
  done: [
    '✨  ✨',
    '      ',
    ' ╰‿╯',
  ],
}

export function AsciiFace({ state, size = 'large' }: AsciiFaceProps) {
  const face = FACES[state]
  const textSize = size === 'small' ? 'text-2xl' : 'text-4xl md:text-6xl'

  return (
    <pre 
      className={`font-mono ${textSize} leading-relaxed select-none text-center`}
      style={{ 
        color: 'rgba(255, 255, 255, 0.95)',
        textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
      }}
    >
      {face.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </pre>
  )
}
