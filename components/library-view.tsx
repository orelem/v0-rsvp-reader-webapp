"use client"

import { useState, useMemo } from "react"
import { Search, Plus, Grid3X3, List, SortAsc } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileUpload } from "./file-upload"
import { DocumentCard } from "./document-card"
import { SettingsPanel } from "./settings-panel"
import type { Document, UserPreferences } from "@/lib/types"

type SortOption = "title" | "dateAdded" | "lastRead" | "progress"

interface LibraryViewProps {
  documents: Document[]
  preferences: UserPreferences
  onSelectDocument: (document: Document) => void
  onImportDocument: (document: Document) => void
  onDeleteDocument: (id: string) => void
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void
}

export function LibraryView({
  documents,
  preferences,
  onSelectDocument,
  onImportDocument,
  onDeleteDocument,
  onUpdatePreferences,
}: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("lastRead")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = documents.filter(
        (doc) => doc.title.toLowerCase().includes(query) || doc.author.toLowerCase().includes(query),
      )
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "dateAdded":
          return b.dateAdded - a.dateAdded
        case "lastRead":
          return b.lastRead - a.lastRead
        case "progress":
          return b.readingProgress - a.readingProgress
        default:
          return 0
      }
    })
  }, [documents, searchQuery, sortBy])

  const handleImport = (document: Document) => {
    onImportDocument(document)
    setImportDialogOpen(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Library</h1>

          <div className="flex items-center gap-2">
            <SettingsPanel preferences={preferences} onUpdatePreferences={onUpdatePreferences} />

            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Document</DialogTitle>
                </DialogHeader>
                <FileUpload onFileImport={handleImport} className="mt-4" />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SortAsc className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("title")}>Sort by Title</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("dateAdded")}>Sort by Date Added</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("lastRead")}>Sort by Last Read</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("progress")}>Sort by Progress</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        {filteredAndSortedDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {documents.length === 0 ? (
              <>
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-medium mb-2">No documents yet</h2>
                <p className="text-muted-foreground mb-4">Import your first document to start speed reading</p>
                <Button onClick={() => setImportDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Import Document
                </Button>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-lg font-medium mb-2">No results found</h2>
                <p className="text-muted-foreground">Try a different search term</p>
              </>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"
            }
          >
            {filteredAndSortedDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onSelect={onSelectDocument} onDelete={onDeleteDocument} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
