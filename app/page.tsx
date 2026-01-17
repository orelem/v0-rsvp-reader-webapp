"use client"

import { useState, useEffect, useCallback } from "react"
import { LibraryView } from "@/components/library-view"
import { ReaderView } from "@/components/reader-view"
import { WelcomeScreen } from "@/components/welcome-screen"
import { FileUpload } from "@/components/file-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  getDocuments,
  saveDocument,
  deleteDocument,
  getPreferences,
  savePreferences,
  updateDocumentProgress,
  initializeStorage,
} from "@/lib/storage"
import type { Document, UserPreferences } from "@/lib/types"
import { DEFAULT_PREFERENCES } from "@/lib/types"
import { cn } from "@/lib/utils"

// Demo text for first-time users
const DEMO_DOCUMENT: Document = {
  id: "demo",
  title: "Introduction to Speed Reading",
  author: "RSVP Reader",
  source: "demo.txt",
  format: "txt",
  content: `Welcome to RSVP Speed Reading! This demonstration will show you how Rapid Serial Visual Presentation works.

RSVP technology displays words one at a time in a fixed position on screen. This eliminates the need for your eyes to move across lines of text, which is one of the biggest bottlenecks in traditional reading.

Notice the highlighted letter in each word? That's the Optimal Recognition Point, or ORP. It's positioned slightly left of center, where your eye naturally focuses when processing a word.

By keeping your eyes fixed on one spot while words flash before you, your brain can process text much faster. Most people can comfortably read at 300 words per minute, and with practice, speeds of 500 to 1000 words per minute are achievable.

Try adjusting the speed using the controls below. Start at a comfortable pace and gradually increase it as you become more comfortable with the technique.

Here are some tips for effective speed reading: First, minimize subvocalization, which is the habit of pronouncing words in your head. Second, trust your brain to absorb meaning even at higher speeds. Third, practice regularly to build your speed reading stamina.

The RSVP method is particularly effective for consuming informational content like articles, reports, and non-fiction books. For dense technical material or literature you want to savor, you might prefer the traditional reading mode.

You can switch between RSVP and traditional mode at any time by clicking the book icon. Your reading position is automatically saved, so you can always pick up where you left off.

Ready to start? Import your own documents from the library view. We support PDF, EPUB, plain text, and Markdown files. Happy speed reading!`,
  wordCount: 273,
  chapters: [
    {
      id: "demo-chapter",
      title: "Full Document",
      startWordIndex: 0,
      endWordIndex: 272,
      wordCount: 273,
    },
  ],
  dateAdded: Date.now(),
  lastRead: 0,
  currentPosition: 0,
  readingProgress: 0,
}

type AppView = "welcome" | "library" | "reader"

export default function RSVPReaderApp() {
  const [view, setView] = useState<AppView>("welcome")
  const [documents, setDocuments] = useState<Document[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize storage and load data
  useEffect(() => {
    initializeStorage()
    const loadedDocuments = getDocuments()
    const loadedPreferences = getPreferences()

    setDocuments(loadedDocuments)
    setPreferences(loadedPreferences)

    // Show welcome screen only if no documents exist
    if (loadedDocuments.length > 0) {
      setView("library")
    }

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const html = document.documentElement

    // Remove all theme classes first
    html.classList.remove("light", "dark", "sepia", "forest", "high-contrast", "reduced-motion")

    // Add the current theme class (dark is default in :root, so we don't add a class for it)
    if (preferences.theme !== "dark") {
      html.classList.add(preferences.theme)
    }

    // Add accessibility classes
    if (preferences.accessibility.highContrast) {
      html.classList.add("high-contrast")
    }
    if (preferences.accessibility.reducedMotion) {
      html.classList.add("reduced-motion")
    }
  }, [preferences.theme, preferences.accessibility.highContrast, preferences.accessibility.reducedMotion, isLoaded])

  const handleSelectDocument = useCallback((document: Document) => {
    setSelectedDocument(document)
    setView("reader")
  }, [])

  const handleImportDocument = useCallback(
    (document: Document) => {
      saveDocument(document)
      setDocuments((prev) => [...prev, document])
      setImportDialogOpen(false)

      // If coming from welcome screen, go to library
      if (view === "welcome") {
        setView("library")
      }
    },
    [view],
  )

  const handleDeleteDocument = useCallback(
    (id: string) => {
      deleteDocument(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))

      if (selectedDocument?.id === id) {
        setSelectedDocument(null)
        setView("library")
      }
    },
    [selectedDocument],
  )

  const handleUpdatePosition = useCallback(
    (position: number) => {
      if (!selectedDocument) return

      updateDocumentProgress(selectedDocument.id, position, selectedDocument.wordCount)

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === selectedDocument.id
            ? {
                ...d,
                currentPosition: position,
                readingProgress: Math.round((position / d.wordCount) * 100),
                lastRead: Date.now(),
              }
            : d,
        ),
      )

      setSelectedDocument((prev) =>
        prev
          ? {
              ...prev,
              currentPosition: position,
              readingProgress: Math.round((position / prev.wordCount) * 100),
              lastRead: Date.now(),
            }
          : null,
      )
    },
    [selectedDocument],
  )

  const handleUpdatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...updates }
      savePreferences(updated)
      return updated
    })
  }, [])

  const handleTryDemo = useCallback(() => {
    // Add demo document if not already in library
    if (!documents.find((d) => d.id === "demo")) {
      handleImportDocument(DEMO_DOCUMENT)
    }
    setSelectedDocument(DEMO_DOCUMENT)
    setView("reader")
  }, [documents, handleImportDocument])

  const handleBackToLibrary = useCallback(() => {
    setView("library")
    setSelectedDocument(null)
  }, [])

  // Don't render until loaded to prevent hydration issues
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const wrapperClass = cn("min-h-screen", preferences.accessibility.dyslexicFont && "font-dyslexic")

  if (view === "welcome") {
    return (
      <div className={wrapperClass}>
        <WelcomeScreen onTryDemo={handleTryDemo} onImport={() => setImportDialogOpen(true)} />
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Document</DialogTitle>
            </DialogHeader>
            <FileUpload onFileImport={handleImportDocument} className="mt-4" />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (view === "reader" && selectedDocument) {
    return (
      <div className={wrapperClass}>
        <ReaderView
          document={selectedDocument}
          preferences={preferences}
          onBack={handleBackToLibrary}
          onUpdatePosition={handleUpdatePosition}
          onUpdatePreferences={handleUpdatePreferences}
        />
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <LibraryView
        documents={documents}
        preferences={preferences}
        onSelectDocument={handleSelectDocument}
        onImportDocument={handleImportDocument}
        onDeleteDocument={handleDeleteDocument}
        onUpdatePreferences={handleUpdatePreferences}
      />
    </div>
  )
}
