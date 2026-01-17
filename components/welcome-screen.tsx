"use client"

import { Button } from "@/components/ui/button"
import { Zap, BookOpen, Upload, ArrowRight } from "lucide-react"

interface WelcomeScreenProps {
  onTryDemo: () => void
  onImport: () => void
}

export function WelcomeScreen({ onTryDemo, onImport }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-2xl text-center">
        {/* Logo/Icon */}
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Zap className="h-10 w-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">Read Faster with RSVP</h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
          Rapid Serial Visual Presentation displays text one word at a time, eliminating eye movement and dramatically
          increasing your reading speed. Start reading at 300+ words per minute today.
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="p-4 rounded-lg bg-secondary/50">
            <Zap className="h-6 w-6 text-primary mb-2 mx-auto" />
            <h3 className="font-medium mb-1">Speed Reading</h3>
            <p className="text-sm text-muted-foreground">Read 2-3x faster with ORP highlighting</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <BookOpen className="h-6 w-6 text-primary mb-2 mx-auto" />
            <h3 className="font-medium mb-1">Multiple Formats</h3>
            <p className="text-sm text-muted-foreground">Import PDF, EPUB, TXT, and MD files</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <Upload className="h-6 w-6 text-primary mb-2 mx-auto" />
            <h3 className="font-medium mb-1">Your Library</h3>
            <p className="text-sm text-muted-foreground">Organize and track your reading progress</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={onTryDemo} className="gap-2">
            Try Demo
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import Your First Document
          </Button>
        </div>

        {/* Keyboard hints */}
        <p className="text-xs text-muted-foreground mt-8">
          Tip: Use <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Space</kbd> to play/pause and{" "}
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">←</kbd>{" "}
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">→</kbd> to navigate
        </p>
      </div>
    </div>
  )
}
