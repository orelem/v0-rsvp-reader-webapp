"use client"

import { Progress } from "@/components/ui/progress"

interface ReadingProgressProps {
  current: number
  total: number
  className?: string
}

export function ReadingProgress({ current, total, className }: ReadingProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>
          Word {current.toLocaleString()} of {total.toLocaleString()}
        </span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-1" />
    </div>
  )
}
