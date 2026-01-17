"use client"

import type React from "react"

import { useMemo, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { Document, AccessibilitySettings } from "@/lib/types"

interface TraditionalReaderProps {
  document: Document
  currentPosition: number
  onPositionChange: (position: number) => void
  fontSize: number
  accessibility?: AccessibilitySettings
  className?: string
}

export function TraditionalReader({
  document,
  currentPosition,
  onPositionChange,
  fontSize,
  accessibility,
  className,
}: TraditionalReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const words = useMemo(() => document.content.split(/\s+/).filter((w) => w.length > 0), [document.content])

  // Split content into paragraphs for better readability
  const paragraphs = useMemo(() => {
    return document.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  }, [document.content])

  // Calculate which word index each paragraph starts at
  const paragraphWordIndices = useMemo(() => {
    let wordIndex = 0
    return paragraphs.map((p) => {
      const startIndex = wordIndex
      const paragraphWords = p.split(/\s+/).filter((w) => w.length > 0)
      wordIndex += paragraphWords.length
      return { startIndex, endIndex: wordIndex - 1, words: paragraphWords }
    })
  }, [paragraphs])

  // Click on a word to jump to that position
  const handleWordClick = useCallback(
    (wordIndex: number) => {
      onPositionChange(wordIndex)
    },
    [onPositionChange],
  )

  const effectiveFontSize = accessibility?.fontSize ?? fontSize
  const textStyle: React.CSSProperties = {
    fontSize: `${effectiveFontSize}px`,
    letterSpacing: accessibility?.letterSpacing ? `${accessibility.letterSpacing}px` : undefined,
    wordSpacing: accessibility?.wordSpacing ? `${accessibility.wordSpacing}px` : undefined,
    lineHeight: accessibility?.lineHeight ?? 1.6,
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-auto px-4 md:px-8 lg:px-16 py-8",
        accessibility?.dyslexicFont && "font-dyslexic",
        className,
      )}
      style={textStyle}
    >
      <div className="max-w-3xl mx-auto">
        {paragraphWordIndices.map((paragraph, pIndex) => {
          let globalWordIndex = paragraph.startIndex

          return (
            <p key={pIndex} className="mb-6">
              {paragraph.words.map((word, wIndex) => {
                const wordIndex = globalWordIndex++
                const isCurrentWord = wordIndex === currentPosition
                const isPastWord = wordIndex < currentPosition

                return (
                  <span
                    key={wIndex}
                    onClick={() => handleWordClick(wordIndex)}
                    className={cn(
                      "cursor-pointer transition-colors hover:text-primary",
                      isCurrentWord && "bg-primary/20 text-primary font-medium rounded px-0.5",
                      isPastWord && "text-muted-foreground",
                    )}
                  >
                    {word}{" "}
                  </span>
                )
              })}
            </p>
          )
        })}
      </div>
    </div>
  )
}
