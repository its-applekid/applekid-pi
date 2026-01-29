// Rotating message variations for each mode

export const GM_MESSAGES = [
  'GM',
  'gm gm',
  'sup',
  'yooo',
  'wagmi',
  'rise n grind',
  'lesgo',
  'anotha day',
  'vibin',
  'hey hey',
]

export const POMODORO_WORK_MESSAGES = [
  'FOCUS',
  'WORK',
  'GRIND',
  'LOCK IN',
  'DEEP WORK',
  'FLOW STATE',
  'GET IT',
  'HUSTLE',
  'EXECUTE',
  'SHIP IT',
]

export const POMODORO_BREAK_MESSAGES = [
  'RELAX',
  'CHILL',
  'BREATHE',
  'REST UP',
  'RECHARGE',
  'STRETCH',
  'HYDRATE',
  'RESET',
  'ZEN',
  'PAUSE',
]

export const STOPWATCH_MESSAGES = [
  'LFG',
  "LET'S GOOOO",
  'GO GO GO',
  'SEND IT',
  'FULL SEND',
  'TRACK IT',
  'TICKING',
  'ON THE CLOCK',
  'RACE MODE',
  'SPEEDRUN',
]

// Get a random message from an array
export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)]
}

// Get messages for the ticker based on current mode
export function getTickerMessages(mode: 'gm' | 'pomodoro-work' | 'pomodoro-break' | 'stopwatch'): string[] {
  switch (mode) {
    case 'pomodoro-work':
      return POMODORO_WORK_MESSAGES
    case 'pomodoro-break':
      return POMODORO_BREAK_MESSAGES
    case 'stopwatch':
      return STOPWATCH_MESSAGES
    default:
      return GM_MESSAGES
  }
}
