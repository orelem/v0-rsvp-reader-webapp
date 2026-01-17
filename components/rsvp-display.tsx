"use client"

import type React from "react"

import { processWord, type RSVPWord } from "@/lib/rsvp-engine"
import type { AccessibilitySettings } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RSVPDisplayProps {
  word: string
  accessibility?: AccessibilitySettings
  className?: string
}

export function RSVPDisplay({ word, accessibility, className }: RSVPDisplayProps) {
  const processed: RSVPWord = processWord(word)

  const textStyle: React.CSSProperties = accessibility
    ? {
        letterSpacing: `${accessibility.letterSpacing}px`,
        wordSpacing: `${accessibility.wordSpacing}px`,
      }
    : {}

  return (
    <div className={cn("flex items-center justify-center select-none", className)}>
      <div
        className={cn(
          "relative flex items-center font-mono text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight",
          accessibility?.dyslexicFont && "font-dyslexic",
        )}
        style={textStyle}
      >
        {/* Guide lines */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-2 w-px bg-primary/30" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-2 w-px bg-primary/30" />

        {/* Word display with ORP alignment */}
        <div className="flex">
          <span className="text-foreground/90 text-right" style={{ minWidth: "2ch" }}>
            {processed.beforeORP}
          </span>
          <span className="text-primary font-bold">{processed.orpChar}</span>
          <span className="text-foreground/90 text-left">{processed.afterORP}</span>
        </div>
      </div>
    </div>
  )
}
