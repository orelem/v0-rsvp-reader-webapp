import type { Document, Chapter } from "./types"
import * as pdfjsLib from "pdfjs-dist"

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs"
}

// Supported file formats with metadata
export const SUPPORTED_FORMATS = [
  { ext: ".epub", name: "EPUB", mime: "application/epub+zip" },
  { ext: ".pdf", name: "PDF", mime: "application/pdf" },
  { ext: ".txt", name: "Plain Text", mime: "text/plain" },
  { ext: ".md", name: "Markdown", mime: "text/markdown" },
  { ext: ".rtf", name: "Rich Text", mime: "application/rtf" },
  {
    ext: ".docx",
    name: "Word Document",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  { ext: ".doc", name: "Word (Legacy)", mime: "application/msword" },
  { ext: ".odt", name: "OpenDocument", mime: "application/vnd.oasis.opendocument.text" },
  { ext: ".mobi", name: "Mobi", mime: "application/x-mobipocket-ebook" },
  { ext: ".azw", name: "Kindle AZW", mime: "application/vnd.amazon.ebook" },
  { ext: ".azw3", name: "Kindle AZW3", mime: "application/vnd.amazon.ebook" },
  { ext: ".fb2", name: "FictionBook", mime: "application/x-fictionbook+xml" },
  { ext: ".cbz", name: "Comic Book (ZIP)", mime: "application/vnd.comicbook+zip" },
  { ext: ".cbr", name: "Comic Book (RAR)", mime: "application/vnd.comicbook-rar" },
  { ext: ".html", name: "HTML", mime: "text/html" },
  { ext: ".htm", name: "HTML", mime: "text/html" },
]

export const ACCEPTED_FILE_TYPES = SUPPORTED_FORMATS.map((f) => f.ext).join(",")

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length
}

function detectChapters(text: string): Chapter[] {
  const chapters: Chapter[] = []
  const words = text.split(/\s+/).filter((w) => w.length > 0)

  const chapterPattern = /^(chapter|part|section)\s*\d*[.:]/i
  let currentChapter: Chapter | null = null

  const lines = text.split("\n")
  let lineWordIndex = 0

  lines.forEach((line) => {
    const lineWords = line.split(/\s+/).filter((w) => w.length > 0)

    if (chapterPattern.test(line.trim())) {
      if (currentChapter) {
        currentChapter.endWordIndex = lineWordIndex - 1
        currentChapter.wordCount = currentChapter.endWordIndex - currentChapter.startWordIndex + 1
        chapters.push(currentChapter)
      }
      currentChapter = {
        id: generateId(),
        title: line.trim().substring(0, 50),
        startWordIndex: lineWordIndex,
        endWordIndex: 0,
        wordCount: 0,
      }
    }
    lineWordIndex += lineWords.length
  })

  if (currentChapter) {
    currentChapter.endWordIndex = words.length - 1
    currentChapter.wordCount = currentChapter.endWordIndex - currentChapter.startWordIndex + 1
    chapters.push(currentChapter)
  }

  if (chapters.length === 0) {
    chapters.push({
      id: generateId(),
      title: "Full Document",
      startWordIndex: 0,
      endWordIndex: words.length - 1,
      wordCount: words.length,
    })
  }

  return chapters
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function getFormatFromExtension(filename: string): Document["format"] {
  const ext = filename.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "epub":
      return "epub"
    case "pdf":
      return "pdf"
    case "txt":
      return "txt"
    case "md":
      return "md"
    case "docx":
      return "docx"
    case "doc":
      return "doc"
    case "odt":
      return "odt"
    case "rtf":
      return "rtf"
    case "mobi":
      return "mobi"
    case "azw":
      return "azw"
    case "azw3":
      return "azw3"
    case "fb2":
      return "fb2"
    case "cbz":
      return "cbz"
    case "cbr":
      return "cbr"
    case "html":
    case "htm":
      return "html"
    default:
      return "txt"
  }
}

export async function parseTextFile(file: File): Promise<Document> {
  const content = await file.text()
  const cleanedContent = content.replace(/\r\n/g, "\n").trim()
  const wordCount = countWords(cleanedContent)

  return {
    id: generateId(),
    title: file.name.replace(/\.(txt|md)$/i, ""),
    author: "Unknown",
    source: file.name,
    format: file.name.endsWith(".md") ? "md" : "txt",
    content: cleanedContent,
    wordCount,
    chapters: detectChapters(cleanedContent),
    dateAdded: Date.now(),
    lastRead: 0,
    currentPosition: 0,
    readingProgress: 0,
  }
}

export async function parsePdfFile(file: File): Promise<Document> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ""

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: { str?: string }) => item.str || "").join(" ")
    fullText += pageText + "\n\n"
  }

  const cleanedContent = fullText.trim()
  const wordCount = countWords(cleanedContent)

  return {
    id: generateId(),
    title: file.name.replace(/\.pdf$/i, ""),
    author: "Unknown",
    source: file.name,
    format: "pdf",
    content: cleanedContent,
    wordCount,
    chapters: detectChapters(cleanedContent),
    dateAdded: Date.now(),
    lastRead: 0,
    currentPosition: 0,
    readingProgress: 0,
  }
}

export async function parseEpubFile(file: File): Promise<Document> {
  const arrayBuffer = await file.arrayBuffer()

  try {
    const JSZip = (await import("jszip")).default
    const zip = await JSZip.loadAsync(arrayBuffer)

    let fullText = ""
    const htmlFiles: string[] = []

    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.match(/\.(html|xhtml)$/i) && !zipEntry.dir) {
        htmlFiles.push(relativePath)
      }
    })

    htmlFiles.sort()

    for (const filePath of htmlFiles) {
      const content = await zip.file(filePath)?.async("string")
      if (content) {
        const textContent = stripHtml(content)
        if (textContent) {
          fullText += textContent + "\n\n"
        }
      }
    }

    const cleanedContent = fullText.trim()
    const wordCount = countWords(cleanedContent)

    return {
      id: generateId(),
      title: file.name.replace(/\.epub$/i, ""),
      author: "Unknown",
      source: file.name,
      format: "epub",
      content: cleanedContent,
      wordCount,
      chapters: detectChapters(cleanedContent),
      dateAdded: Date.now(),
      lastRead: 0,
      currentPosition: 0,
      readingProgress: 0,
    }
  } catch {
    throw new Error("Failed to parse EPUB file")
  }
}

export async function parseHtmlFile(file: File): Promise<Document> {
  const content = await file.text()
  const textContent = stripHtml(content)
  const wordCount = countWords(textContent)

  return {
    id: generateId(),
    title: file.name.replace(/\.(html|htm)$/i, ""),
    author: "Unknown",
    source: file.name,
    format: "html",
    content: textContent,
    wordCount,
    chapters: detectChapters(textContent),
    dateAdded: Date.now(),
    lastRead: 0,
    currentPosition: 0,
    readingProgress: 0,
  }
}

export async function parseDocxFile(file: File): Promise<Document> {
  const arrayBuffer = await file.arrayBuffer()

  try {
    const JSZip = (await import("jszip")).default
    const zip = await JSZip.loadAsync(arrayBuffer)

    // DOCX stores content in word/document.xml
    const documentXml = await zip.file("word/document.xml")?.async("string")

    if (!documentXml) {
      throw new Error("Invalid DOCX file: missing document.xml")
    }

    // Extract text from XML
    const textContent = documentXml
      .replace(/<w:p[^>]*>/g, "\n") // Paragraph breaks
      .replace(/<w:br[^>]*>/g, "\n") // Line breaks
      .replace(/<[^>]+>/g, "") // Strip all XML tags
      .replace(/\s+/g, " ")
      .trim()

    const wordCount = countWords(textContent)

    return {
      id: generateId(),
      title: file.name.replace(/\.docx$/i, ""),
      author: "Unknown",
      source: file.name,
      format: "docx",
      content: textContent,
      wordCount,
      chapters: detectChapters(textContent),
      dateAdded: Date.now(),
      lastRead: 0,
      currentPosition: 0,
      readingProgress: 0,
    }
  } catch (e) {
    throw new Error("Failed to parse DOCX file: " + (e instanceof Error ? e.message : "Unknown error"))
  }
}

export async function parseOdtFile(file: File): Promise<Document> {
  const arrayBuffer = await file.arrayBuffer()

  try {
    const JSZip = (await import("jszip")).default
    const zip = await JSZip.loadAsync(arrayBuffer)

    // ODT stores content in content.xml
    const contentXml = await zip.file("content.xml")?.async("string")

    if (!contentXml) {
      throw new Error("Invalid ODT file: missing content.xml")
    }

    // Extract text from XML
    const textContent = contentXml
      .replace(/<text:p[^>]*>/g, "\n") // Paragraph breaks
      .replace(/<text:line-break[^>]*>/g, "\n") // Line breaks
      .replace(/<[^>]+>/g, "") // Strip all XML tags
      .replace(/\s+/g, " ")
      .trim()

    const wordCount = countWords(textContent)

    return {
      id: generateId(),
      title: file.name.replace(/\.odt$/i, ""),
      author: "Unknown",
      source: file.name,
      format: "odt",
      content: textContent,
      wordCount,
      chapters: detectChapters(textContent),
      dateAdded: Date.now(),
      lastRead: 0,
      currentPosition: 0,
      readingProgress: 0,
    }
  } catch (e) {
    throw new Error("Failed to parse ODT file: " + (e instanceof Error ? e.message : "Unknown error"))
  }
}

export async function parseRtfFile(file: File): Promise<Document> {
  const content = await file.text()

  // Basic RTF to plain text conversion
  const textContent = content
    .replace(/\\par\s*/g, "\n") // Paragraph breaks
    .replace(/\\\w+\s?/g, "") // Remove RTF control words
    .replace(/[{}]/g, "") // Remove braces
    .replace(/\s+/g, " ")
    .trim()

  const wordCount = countWords(textContent)

  return {
    id: generateId(),
    title: file.name.replace(/\.rtf$/i, ""),
    author: "Unknown",
    source: file.name,
    format: "rtf",
    content: textContent,
    wordCount,
    chapters: detectChapters(textContent),
    dateAdded: Date.now(),
    lastRead: 0,
    currentPosition: 0,
    readingProgress: 0,
  }
}

export async function parseFb2File(file: File): Promise<Document> {
  const content = await file.text()

  // FB2 is XML-based
  const textContent = content
    .replace(/<p>/gi, "\n")
    .replace(/<empty-line\s*\/>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()

  const wordCount = countWords(textContent)

  return {
    id: generateId(),
    title: file.name.replace(/\.fb2$/i, ""),
    author: "Unknown",
    source: file.name,
    format: "fb2",
    content: textContent,
    wordCount,
    chapters: detectChapters(textContent),
    dateAdded: Date.now(),
    lastRead: 0,
    currentPosition: 0,
    readingProgress: 0,
  }
}

export async function parseMobiFile(file: File): Promise<Document> {
  // MOBI/AZW files have a complex binary format
  // For basic support, we attempt to extract readable text
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)

  // Try to find and extract text content (simplified approach)
  let textContent = ""

  // Look for readable ASCII sequences
  let currentString = ""
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    // Printable ASCII range or newline/tab
    if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
      currentString += String.fromCharCode(byte)
    } else {
      if (currentString.length > 20) {
        // Only keep strings longer than 20 chars
        textContent += currentString + " "
      }
      currentString = ""
    }
  }

  if (currentString.length > 20) {
    textContent += currentString
  }

  // Clean up
  textContent = textContent
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E\n]/g, "") // Keep only printable ASCII
    .trim()

  if (textContent.length < 100) {
    throw new Error(
      "Could not extract readable text from MOBI/AZW file. Try converting to EPUB first using Calibre or a similar tool.",
    )
  }

  const wordCount = countWords(textContent)
  const format = getFormatFromExtension(file.name)

  return {
    id: generateId(),
    title: file.name.replace(/\.(mobi|azw|azw3)$/i, ""),
    author: "Unknown",
    source: file.name,
    format,
    content: textContent,
    wordCount,
    chapters: detectChapters(textContent),
    dateAdded: Date.now(),
    lastRead: 0,
    currentPosition: 0,
    readingProgress: 0,
  }
}

export async function parseComicBookFile(file: File): Promise<Document> {
  // CBZ/CBR files are ZIP/RAR archives containing images
  // We can't extract text from images, so we provide a helpful message
  const ext = file.name.split(".").pop()?.toLowerCase()

  if (ext === "cbr") {
    throw new Error(
      "CBR (RAR) comic book files are not supported. Please convert to CBZ format first, or use a dedicated comic reader.",
    )
  }

  // For CBZ, we can list the images but can't extract text
  try {
    const JSZip = (await import("jszip")).default
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)

    const imageFiles: string[] = []
    zip.forEach((relativePath) => {
      if (relativePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        imageFiles.push(relativePath)
      }
    })

    if (imageFiles.length === 0) {
      throw new Error("No images found in CBZ file")
    }

    // Create a placeholder document indicating it's a comic
    const content = `This is a comic book file (${file.name}) containing ${imageFiles.length} pages.\n\nComic book files contain images rather than text, so they cannot be read using RSVP or traditional reading modes.\n\nFor the best comic reading experience, please use a dedicated comic reader application.`

    return {
      id: generateId(),
      title: file.name.replace(/\.cbz$/i, ""),
      author: "Unknown",
      source: file.name,
      format: "cbz",
      content,
      wordCount: countWords(content),
      chapters: [
        {
          id: generateId(),
          title: "Comic Info",
          startWordIndex: 0,
          endWordIndex: countWords(content) - 1,
          wordCount: countWords(content),
        },
      ],
      dateAdded: Date.now(),
      lastRead: 0,
      currentPosition: 0,
      readingProgress: 0,
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("CBR")) {
      throw e
    }
    throw new Error("Failed to parse comic book file: " + (e instanceof Error ? e.message : "Unknown error"))
  }
}

export async function parseDocLegacy(file: File): Promise<Document> {
  // Legacy .doc files use a complex binary format (OLE)
  // For basic support, try to extract readable text similar to MOBI
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)

  let textContent = ""
  let currentString = ""

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
      currentString += String.fromCharCode(byte)
    } else {
      if (currentString.length > 10) {
        textContent += currentString + " "
      }
      currentString = ""
    }
  }

  if (currentString.length > 10) {
    textContent += currentString
  }

  textContent = textContent
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E\n]/g, "")
    .trim()

  if (textContent.length < 50) {
    throw new Error(
      "Could not extract readable text from legacy .doc file. Please save the document as .docx format for better compatibility.",
    )
  }

  const wordCount = countWords(textContent)

  return {
    id: generateId(),
    title: file.name.replace(/\.doc$/i, ""),
    author: "Unknown",
    source: file.name,
    format: "doc",
    content: textContent,
    wordCount,
    chapters: detectChapters(textContent),
    dateAdded: Date.now(),
    lastRead: 0,
    currentPosition: 0,
    readingProgress: 0,
  }
}

export async function parseFile(file: File): Promise<Document> {
  const extension = file.name.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "txt":
    case "md":
      return parseTextFile(file)
    case "pdf":
      return parsePdfFile(file)
    case "epub":
      return parseEpubFile(file)
    case "html":
    case "htm":
      return parseHtmlFile(file)
    case "docx":
      return parseDocxFile(file)
    case "doc":
      return parseDocLegacy(file)
    case "odt":
      return parseOdtFile(file)
    case "rtf":
      return parseRtfFile(file)
    case "fb2":
      return parseFb2File(file)
    case "mobi":
    case "azw":
    case "azw3":
      return parseMobiFile(file)
    case "cbz":
    case "cbr":
      return parseComicBookFile(file)
    default:
      throw new Error(`Unsupported file format: .${extension}`)
  }
}
