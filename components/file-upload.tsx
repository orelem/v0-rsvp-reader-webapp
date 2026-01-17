"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Upload, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseFile, SUPPORTED_FORMATS, ACCEPTED_FILE_TYPES } from "@/lib/file-parser"
import type { Document } from "@/lib/types"

interface FileUploadProps {
  onFileImport: (document: Document) => void
  className?: string
}

export function FileUpload({ onFileImport, className }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setIsProcessing(true)
      setError(null)

      try {
        const document = await parseFile(file)
        onFileImport(document)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to process file")
      } finally {
        setIsProcessing(false)
      }
    },
    [onFileImport],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  return (
    <div className={className}>
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50",
          isProcessing && "pointer-events-none opacity-60",
        )}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Processing file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                EPUB, PDF, TXT, MD, DOCX, RTF, ODT, MOBI, FB2, HTML, CBZ
              </p>
            </div>
          </div>
        )}
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleInputChange}
          disabled={isProcessing}
        />
      </label>

      {error && (
        <p className="mt-2 text-sm text-destructive flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {error}
        </p>
      )}

      <details className="mt-3">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
          View all supported formats ({SUPPORTED_FORMATS.length})
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
          {SUPPORTED_FORMATS.map((format) => (
            <div key={format.ext} className="flex items-center gap-1">
              <span className="font-mono text-primary">{format.ext}</span>
              <span>{format.name}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
