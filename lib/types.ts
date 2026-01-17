export interface Document {
  id: string
  title: string
  author: string
  source: string
  format:
    | "epub"
    | "pdf"
    | "txt"
    | "md"
    | "docx"
    | "doc"
    | "odt"
    | "rtf"
    | "mobi"
    | "azw"
    | "azw3"
    | "fb2"
    | "cbz"
    | "cbr"
    | "html"
  content: string
  wordCount: number
  chapters: Chapter[]
  dateAdded: number
  lastRead: number
  currentPosition: number
  readingProgress: number
}

export interface Chapter {
  id: string
  title: string
  startWordIndex: number
  endWordIndex: number
  wordCount: number
}

export interface ReadingSession {
  id: string
  documentId: string
  startTime: number
  endTime: number
  startPosition: number
  endPosition: number
  wordsRead: number
  averageSpeed: number
  mode: "rsvp" | "traditional"
}

export type ThemeOption = "dark" | "light" | "sepia" | "forest"

export interface AccessibilitySettings {
  dyslexicFont: boolean
  fontSize: number
  letterSpacing: number
  lineHeight: number
  wordSpacing: number
  highContrast: boolean
  reducedMotion: boolean
}

export interface UserPreferences {
  defaultSpeed: number
  theme: ThemeOption
  orpHighlightColor: string
  backgroundColor: string
  textColor: string
  font: string
  fontSize: number
  punctuationPause: number
  autoSave: boolean
  lastUsedMode: "rsvp" | "traditional"
  showWPM: boolean
  wordsPerChunk: 1 | 2 | 3
  accessibility: AccessibilitySettings
}

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  dyslexicFont: false,
  fontSize: 18,
  letterSpacing: 0,
  lineHeight: 1.6,
  wordSpacing: 0,
  highContrast: false,
  reducedMotion: false,
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultSpeed: 300,
  theme: "dark",
  orpHighlightColor: "#60a5fa",
  backgroundColor: "#0a0a0f",
  textColor: "#f5f5f5",
  font: "Geist",
  fontSize: 18,
  punctuationPause: 150,
  autoSave: true,
  lastUsedMode: "rsvp",
  showWPM: true,
  wordsPerChunk: 1,
  accessibility: DEFAULT_ACCESSIBILITY,
}

export const THEME_CONFIG: Record<ThemeOption, { name: string; description: string }> = {
  dark: { name: "Midnight", description: "Dark blue-gray for low-light reading" },
  light: { name: "Daylight", description: "Clean white for bright environments" },
  sepia: { name: "Parchment", description: "Warm tones for reduced eye strain" },
  forest: { name: "Forest", description: "Deep green for a natural feel" },
}
