"use client"

import { formatDistanceToNow } from "date-fns"
import { Clock, BookOpen, Trash2, MoreVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Document } from "@/lib/types"

interface DocumentCardProps {
  document: Document
  onSelect: (document: Document) => void
  onDelete: (id: string) => void
}

export function DocumentCard({ document, onSelect, onDelete }: DocumentCardProps) {
  const formatIcon = {
    pdf: "📕",
    epub: "📗",
    txt: "📄",
    md: "📝",
  }

  return (
    <Card
      className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
      onClick={() => onSelect(document)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{formatIcon[document.format]}</span>
              <h3 className="font-medium truncate">{document.title}</h3>
            </div>

            <p className="text-sm text-muted-foreground truncate mb-3">
              {document.author !== "Unknown" ? document.author : document.source}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {document.wordCount.toLocaleString()} words
              </span>
              {document.lastRead > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(document.lastRead, { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(document.id)
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {document.readingProgress > 0 && (
          <div className="mt-4">
            <Progress value={document.readingProgress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1">{document.readingProgress}% complete</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
