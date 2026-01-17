"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Play, Pause, SkipBack, SkipForward, RotateCcw, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RSVPDisplay } from "./rsvp-display"
import { SpeedControl } from "./speed-control"
import { ReadingProgress } from "./reading-progress"
import { SettingsPanel } from "./settings-panel"
import { tokenizeText, calculateDelay } from "@/lib/rsvp-engine"
import type { Document, UserPreferences } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RSVPReaderProps {
  document: Document
  preferences: UserPreferences
  onPositionChange: (position: number) => void
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void
  onBack: () => void
  onSwitchMode: () => void
}

export function RSVPReader({
  document,
  preferences,
  onPositionChange,
  onUpdatePreferences,
  onBack,
  onSwitchMode,
}: RSVPReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(document.currentPosition)
  const [speed, setSpeed] = useState(preferences.defaultSpeed)
  const [showControls, setShowControls] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentIndexRef = useRef(currentIndex)

  const words = useMemo(() => tokenizeText(document.content), [document.content])
  const currentWord = words[currentIndex] || ""

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Auto-save position periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (preferences.autoSave) {
        onPositionChange(currentIndexRef.current)
      }
    }, 30000) // Save every 30 seconds

    return () => clearInterval(saveInterval)
  }, [preferences.autoSave, onPositionChange])

  // Hide controls after inactivity
  useEffect(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, showControls])

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isPlaying])

  // RSVP playback logic
  const advanceWord = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= words.length - 1) {
        setIsPlaying(false)
        return prev
      }
      return prev + 1
    })
  }, [words.length])

  useEffect(() => {
    if (isPlaying && currentIndex < words.length) {
      const delay = calculateDelay(currentWord, speed, preferences.punctuationPause)
      timerRef.current = setTimeout(advanceWord, delay)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isPlaying, currentIndex, currentWord, speed, preferences.punctuationPause, advanceWord, words.length])

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
    showControlsTemporarily()
  }, [showControlsTemporarily])

  const skipBackward = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 10))
    showControlsTemporarily()
  }, [showControlsTemporarily])

  const skipForward = useCallback(() => {
    setCurrentIndex((prev) => Math.min(words.length - 1, prev + 10))
    showControlsTemporarily()
  }, [words.length, showControlsTemporarily])

  const restart = useCallback(() => {
    setCurrentIndex(0)
    setIsPlaying(false)
    showControlsTemporarily()
  }, [showControlsTemporarily])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case " ":
          e.preventDefault()
          togglePlayPause()
          break
        case "ArrowLeft":
          skipBackward()
          break
        case "ArrowRight":
          skipForward()
          break
        case "ArrowUp":
          setSpeed((prev) => Math.min(1000, prev + 25))
          showControlsTemporarily()
          break
        case "ArrowDown":
          setSpeed((prev) => Math.max(100, prev - 25))
          showControlsTemporarily()
          break
        case "r":
          restart()
          break
        case "Escape":
          onBack()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlayPause, skipBackward, skipForward, restart, onBack, showControlsTemporarily])

  // Save position when leaving
  useEffect(() => {
    const onPositionChangeRef = onPositionChange
    return () => {
      onPositionChangeRef(currentIndexRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex flex-col h-full bg-reader-bg"
      onMouseMove={showControlsTemporarily}
      onClick={showControlsTemporarily}
    >
      {/* Top bar */}
      <header
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b border-border transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <Button variant="ghost" onClick={onBack}>
          Back to Library
        </Button>

        <h2 className="text-sm font-medium truncate max-w-md">{document.title}</h2>

        <div className="flex items-center gap-2">
          <SettingsPanel preferences={preferences} onUpdatePreferences={onUpdatePreferences} />
          <Button variant="ghost" size="icon" onClick={onSwitchMode}>
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main reading area */}
      <main className="flex-1 flex items-center justify-center relative">
        {/* WPM indicator */}
        {preferences.showWPM && (
          <div className="absolute top-4 right-4 text-sm font-mono text-muted-foreground">{speed} WPM</div>
        )}

        <RSVPDisplay word={currentWord} accessibility={preferences.accessibility} />

        {/* Completion message */}
        {currentIndex >= words.length - 1 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">Reading Complete!</h3>
              <p className="text-muted-foreground mb-4">You finished reading {document.title}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={restart}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
                <Button onClick={onBack}>Back to Library</Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom controls */}
      <footer
        className={cn(
          "border-t border-border px-4 py-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <ReadingProgress current={currentIndex + 1} total={words.length} className="mb-4" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Playback controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={restart}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={skipBackward}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="lg" className="h-12 w-12 rounded-full" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={skipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed control */}
          <SpeedControl speed={speed} onSpeedChange={setSpeed} />
        </div>
      </footer>
    </div>
  )
}
