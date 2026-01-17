"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface SpeedControlProps {
  speed: number
  onSpeedChange: (speed: number) => void
  min?: number
  max?: number
  step?: number
}

export function SpeedControl({ speed, onSpeedChange, min = 100, max = 1000, step = 25 }: SpeedControlProps) {
  const decreaseSpeed = () => {
    onSpeedChange(Math.max(min, speed - step))
  }

  const increaseSpeed = () => {
    onSpeedChange(Math.min(max, speed + step))
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={decreaseSpeed} className="h-8 w-8">
        <Minus className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3 min-w-[200px]">
        <Slider
          value={[speed]}
          onValueChange={([value]) => onSpeedChange(value)}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <span className="text-sm font-mono text-muted-foreground w-20 text-right">{speed} WPM</span>
      </div>

      <Button variant="ghost" size="icon" onClick={increaseSpeed} className="h-8 w-8">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
