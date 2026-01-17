import type { Document, UserPreferences, ReadingSession } from "./types"
import { DEFAULT_PREFERENCES } from "./types"

const STORAGE_KEYS = {
  documents: "rsvp_documents",
  sessions: "rsvp_sessions",
  preferences: "rsvp_preferences",
  version: "rsvp_version",
}

const CURRENT_VERSION = "1.0.0"

function safeJSONParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function getDocuments(): Document[] {
  if (typeof window === "undefined") return []
  return safeJSONParse(localStorage.getItem(STORAGE_KEYS.documents), [])
}

export function saveDocuments(documents: Document[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(documents))
  } catch (e) {
    console.error("Failed to save documents:", e)
  }
}

export function getDocument(id: string): Document | undefined {
  return getDocuments().find((doc) => doc.id === id)
}

export function saveDocument(document: Document): void {
  const documents = getDocuments()
  const index = documents.findIndex((d) => d.id === document.id)
  if (index >= 0) {
    documents[index] = document
  } else {
    documents.push(document)
  }
  saveDocuments(documents)
}

export function deleteDocument(id: string): void {
  const documents = getDocuments().filter((d) => d.id !== id)
  saveDocuments(documents)
}

export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES
  return safeJSONParse(localStorage.getItem(STORAGE_KEYS.preferences), DEFAULT_PREFERENCES)
}

export function savePreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences))
  } catch (e) {
    console.error("Failed to save preferences:", e)
  }
}

export function getSessions(): ReadingSession[] {
  if (typeof window === "undefined") return []
  return safeJSONParse(localStorage.getItem(STORAGE_KEYS.sessions), [])
}

export function saveSession(session: ReadingSession): void {
  if (typeof window === "undefined") return
  const sessions = getSessions()
  sessions.push(session)
  // Keep only last 100 sessions
  const trimmedSessions = sessions.slice(-100)
  try {
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(trimmedSessions))
  } catch (e) {
    console.error("Failed to save session:", e)
  }
}

export function updateDocumentProgress(documentId: string, position: number, wordCount: number): void {
  const documents = getDocuments()
  const index = documents.findIndex((d) => d.id === documentId)
  if (index >= 0) {
    documents[index].currentPosition = position
    documents[index].readingProgress = Math.round((position / wordCount) * 100)
    documents[index].lastRead = Date.now()
    saveDocuments(documents)
  }
}

export function initializeStorage(): void {
  if (typeof window === "undefined") return
  const version = localStorage.getItem(STORAGE_KEYS.version)
  if (!version) {
    localStorage.setItem(STORAGE_KEYS.version, CURRENT_VERSION)
  }
}
