"use client"

import { useState, useCallback, useRef } from "react"
import { ArrowLeft, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RSVPReader } from "./rsvp-reader"
import { TraditionalReader } from "./traditional-reader"
import { ReadingProgress } from "./reading-progress"
import { SettingsPanel } from "./settings-panel"
import type { Document, UserPreferences } from "@/lib/types"
import { tokenizeText } from "@/lib/rsvp-engine"

interface ReaderViewProps {
  document: Document
  preferences: UserPreferences
  onBack: () => void
  onUpdatePosition: (position: number) => void
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void
}

export function ReaderView({ document, preferences, onBack, onUpdatePosition, onUpdatePreferences }: ReaderViewProps) {
  const [mode, setMode] = useState<"rsvp" | "traditional">(preferences.lastUsedMode)
  const currentPositionRef = useRef(document.currentPosition)

  const words = tokenizeText(document.content)

  const handlePositionChange = useCallback(
    (position: number) => {
      currentPositionRef.current = position
      onUpdatePosition(position)
    },
    [onUpdatePosition],
  )

  const handleModeSwitch = useCallback(() => {
    const newMode = mode === "rsvp" ? "traditional" : "rsvp"
    setMode(newMode)
    onUpdatePreferences({ lastUsedMode: newMode })
  }, [mode, onUpdatePreferences])

  if (mode === "rsvp") {
    return (
      <RSVPReader
        document={document}
        preferences={preferences}
        onPositionChange={handlePositionChange}
        onUpdatePreferences={onUpdatePreferences}
        onBack={onBack}
        onSwitchMode={handleModeSwitch}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Library
        </Button>

        <h2 className="text-sm font-medium truncate max-w-md">{document.title}</h2>

        <div className="flex items-center gap-2">
          <SettingsPanel preferences={preferences} onUpdatePreferences={onUpdatePreferences} />
          <Button variant="ghost" size="sm" onClick={handleModeSwitch}>
            <Zap className="h-4 w-4 mr-2" />
            RSVP Mode
          </Button>
        </div>
      </header>

      {/* Traditional reader content with accessibility settings */}
      <TraditionalReader
        document={document}
        currentPosition={document.currentPosition}
        onPositionChange={handlePositionChange}
        fontSize={preferences.fontSize}
        accessibility={preferences.accessibility}
      />

      {/* Footer with progress */}
      <footer className="border-t border-border px-4 py-3">
        <ReadingProgress current={document.currentPosition + 1} total={words.length} />
      </footer>
    </div>
  )
}
