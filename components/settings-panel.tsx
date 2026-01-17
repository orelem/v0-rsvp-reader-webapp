"use client"

import type React from "react"

import { useState } from "react"
import { Settings, Moon, Sun, Leaf, BookOpen, Type, Eye, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UserPreferences, ThemeOption, AccessibilitySettings } from "@/lib/types"
import { THEME_CONFIG } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SettingsPanelProps {
  preferences: UserPreferences
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void
}

const THEME_ICONS: Record<ThemeOption, React.ReactNode> = {
  dark: <Moon className="h-4 w-4" />,
  light: <Sun className="h-4 w-4" />,
  sepia: <BookOpen className="h-4 w-4" />,
  forest: <Leaf className="h-4 w-4" />,
}

export function SettingsPanel({ preferences, onUpdatePreferences }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)

  const handleThemeChange = (theme: ThemeOption) => {
    onUpdatePreferences({ theme })
  }

  const handleAccessibilityChange = (updates: Partial<AccessibilitySettings>) => {
    onUpdatePreferences({
      accessibility: { ...preferences.accessibility, ...updates },
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Settings
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="theme" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibility
            </TabsTrigger>
          </TabsList>

          {/* Theme Tab */}
          <TabsContent value="theme" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(THEME_CONFIG) as ThemeOption[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    preferences.theme === theme
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      theme === "dark" && "bg-slate-800 text-slate-200",
                      theme === "light" && "bg-slate-100 text-slate-800",
                      theme === "sepia" && "bg-amber-100 text-amber-800",
                      theme === "forest" && "bg-green-900 text-green-200",
                    )}
                  >
                    {THEME_ICONS[theme]}
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{THEME_CONFIG[theme].name}</p>
                    <p className="text-xs text-muted-foreground">{THEME_CONFIG[theme].description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Reading Speed */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Label className="text-sm font-medium">Default Reading Speed</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[preferences.defaultSpeed]}
                  onValueChange={([value]) => onUpdatePreferences({ defaultSpeed: value })}
                  min={100}
                  max={1000}
                  step={25}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-20 text-right">{preferences.defaultSpeed} WPM</span>
              </div>
            </div>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="mt-4 space-y-6">
            {/* Dyslexic Font */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Dyslexic-Friendly Font
                </Label>
                <p className="text-xs text-muted-foreground">Use OpenDyslexic font for easier reading</p>
              </div>
              <Switch
                checked={preferences.accessibility.dyslexicFont}
                onCheckedChange={(checked) => handleAccessibilityChange({ dyslexicFont: checked })}
              />
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Font Size</Label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">A</span>
                <Slider
                  value={[preferences.accessibility.fontSize]}
                  onValueChange={([value]) => handleAccessibilityChange({ fontSize: value })}
                  min={12}
                  max={32}
                  step={1}
                  className="flex-1"
                />
                <span className="text-lg text-muted-foreground">A</span>
                <span className="text-sm font-mono w-12 text-right">{preferences.accessibility.fontSize}px</span>
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Letter Spacing</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[preferences.accessibility.letterSpacing]}
                  onValueChange={([value]) => handleAccessibilityChange({ letterSpacing: value })}
                  min={0}
                  max={8}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-16 text-right">{preferences.accessibility.letterSpacing}px</span>
              </div>
            </div>

            {/* Word Spacing */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Word Spacing</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[preferences.accessibility.wordSpacing]}
                  onValueChange={([value]) => handleAccessibilityChange({ wordSpacing: value })}
                  min={0}
                  max={16}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-16 text-right">{preferences.accessibility.wordSpacing}px</span>
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Line Height</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[preferences.accessibility.lineHeight]}
                  onValueChange={([value]) => handleAccessibilityChange({ lineHeight: value })}
                  min={1.2}
                  max={2.5}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12 text-right">
                  {preferences.accessibility.lineHeight.toFixed(1)}
                </span>
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">High Contrast</Label>
                <p className="text-xs text-muted-foreground">Increase text contrast for better visibility</p>
              </div>
              <Switch
                checked={preferences.accessibility.highContrast}
                onCheckedChange={(checked) => handleAccessibilityChange({ highContrast: checked })}
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Reduced Motion</Label>
                <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
              </div>
              <Switch
                checked={preferences.accessibility.reducedMotion}
                onCheckedChange={(checked) => handleAccessibilityChange({ reducedMotion: checked })}
              />
            </div>

            {/* Preview */}
            <div className="pt-4 border-t border-border">
              <Label className="text-sm font-medium mb-3 block">Preview</Label>
              <div
                className={cn(
                  "p-4 rounded-lg bg-reader-bg border border-border",
                  preferences.accessibility.dyslexicFont && "font-dyslexic",
                )}
                style={{
                  fontSize: `${preferences.accessibility.fontSize}px`,
                  letterSpacing: `${preferences.accessibility.letterSpacing}px`,
                  wordSpacing: `${preferences.accessibility.wordSpacing}px`,
                  lineHeight: preferences.accessibility.lineHeight,
                }}
              >
                The quick brown fox jumps over the lazy dog. This sample text demonstrates your current accessibility
                settings.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
