export interface RSVPWord {
  word: string
  orpIndex: number // Position of the Optimal Recognition Point character
  beforeORP: string
  orpChar: string
  afterORP: string
}

export function calculateORP(word: string): number {
  // ORP is typically at about 1/3 from the start, slightly left of center
  const length = word.length
  if (length <= 1) return 0
  if (length <= 3) return 0
  if (length <= 5) return 1
  if (length <= 9) return 2
  if (length <= 13) return 3
  return Math.floor(length * 0.25)
}

export function processWord(word: string): RSVPWord {
  const orpIndex = calculateORP(word)
  return {
    word,
    orpIndex,
    beforeORP: word.substring(0, orpIndex),
    orpChar: word.charAt(orpIndex),
    afterORP: word.substring(orpIndex + 1),
  }
}

export function tokenizeText(text: string): string[] {
  // Split text into words, preserving punctuation attached to words
  return text
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.trim())
}

export function calculateDelay(word: string, baseWPM: number, punctuationPause: number): number {
  const baseDelay = 60000 / baseWPM // Base delay in ms

  // Add extra pause for punctuation
  const hasPunctuation = /[.!?;:]$/.test(word)
  const hasComma = /[,]$/.test(word)

  if (hasPunctuation) {
    return baseDelay + punctuationPause
  }
  if (hasComma) {
    return baseDelay + punctuationPause / 2
  }

  // Slightly longer pause for longer words
  if (word.length > 10) {
    return baseDelay * 1.2
  }

  return baseDelay
}
