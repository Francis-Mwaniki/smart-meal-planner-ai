"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

type TourStep = {
  id: string
  targetId: string
  title: string
  description: string
  placement?: "top" | "bottom" | "left" | "right"
}

const STORAGE_KEY = "smartmeal.tour.v1.completed"

// Force client-side only rendering
const AppTourClient = () => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isActive, setIsActive] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)

  // Ensure component only runs on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted
  if (!mounted) {
    return null
  }

  const steps = useMemo<TourStep[]>(() => {
    if (pathname?.startsWith("/dashboard")) {
      return [
        {
          id: "generate-plan",
          targetId: "generate-plan-btn",
          title: "Generate your first plan",
          description: "Click here to create a 3-day meal plan based on your preferences.",
          placement: "bottom",
        },
        {
          id: "todays-meals",
          targetId: "todays-meals-card",
          title: "Today's meals",
          description: "See what's planned for breakfast, lunch, and dinner today.",
          placement: "right",
        },
        {
          id: "weekly-plan",
          targetId: "weekly-plan-card",
          title: "Weekly overview",
          description: "Glance at this week's plan and progress.",
          placement: "top",
        },
        {
          id: "shopping-list",
          targetId: "shopping-list-link",
          title: "Shopping list",
          description: "Open your auto-generated shopping list for the current plan.",
          placement: "left",
        },
        {
          id: "preferences",
          targetId: "preferences-link",
          title: "Preferences",
          description: "Set diet, allergies, budget, and family size so plans fit your needs.",
          placement: "left",
        },
      ]
    }
    return []
  }, [pathname])

  const updateAnchor = useCallback(() => {
    const step = steps[currentIndex]
    if (!step) return
    const el = document.getElementById(step.targetId)
    if (el) {
      const rect = el.getBoundingClientRect()
      setAnchorRect(rect)
    } else {
      setAnchorRect(null)
    }
  }, [currentIndex, steps])

  // Start tour after login if not completed
  useEffect(() => {
    if (!session?.user?.id) return
    if (!pathname?.startsWith("/dashboard")) return
    if (typeof window === "undefined") return
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed && steps.length > 0) {
      setIsActive(true)
      setCurrentIndex(0)
    }
  }, [session?.user?.id, pathname, steps.length])

  // Prepare portal container
  useEffect(() => {
    if (typeof window === "undefined") return
    setContainer(document.body)
  }, [])

  // Reposition on step change, scroll, resize
  useEffect(() => {
    if (!isActive) return
    updateAnchor()
    const onResize = () => updateAnchor()
    const onScroll = () => updateAnchor()
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onScroll, true)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll, true)
    }
  }, [isActive, updateAnchor])

  const goNext = () => {
    if (currentIndex + 1 < steps.length) setCurrentIndex((i) => i + 1)
    else finish()
  }

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const finish = () => {
    setIsActive(false)
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {}
  }

  // Expose restart function for future settings entry
  useEffect(() => {
    ;(window as any).startAppTour = () => {
      localStorage.removeItem(STORAGE_KEY)
      setCurrentIndex(0)
      setIsActive(true)
      setTimeout(updateAnchor, 0)
    }
  }, [updateAnchor])

  if (!isActive || !container) return null
  const step = steps[currentIndex]
  const rect = anchorRect

  return createPortal(
    <div aria-live="polite" aria-label="App tour overlay">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50"
        onClick={finish}
      />

      {/* Spotlight outline */}
      {rect && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-lg ring-2 ring-white/80"
          style={{
            top: rect.top + window.scrollY - 6,
            left: rect.left + window.scrollX - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
            transition: "all 120ms ease-out",
          }}
        />
      )}

      {/* Popover card */}
      <div
        className="fixed z-[10000] max-w-xs rounded-md border bg-white p-4 shadow-lg"
        style={computePopoverPosition(rect, step?.placement)}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-base font-semibold mb-1">{step?.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{step?.description}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-gray-500">
            Step {currentIndex + 1} of {steps.length}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={finish}>Skip</Button>
            {currentIndex > 0 && (
              <Button variant="ghost" size="sm" onClick={goPrev}>Back</Button>
            )}
            <Button size="sm" onClick={goNext}>{currentIndex + 1 === steps.length ? "Done" : "Next"}</Button>
          </div>
        </div>
      </div>
    </div>,
    container
  )
}

function computePopoverPosition(rect: DOMRect | null, placement: TourStep["placement"]) {
  const margin = 12
  const defaultPos = { top: margin, left: margin }
  if (!rect) return defaultPos
  const top = rect.top + window.scrollY
  const left = rect.left + window.scrollX
  switch (placement) {
    case "top":
      return { top: top - margin - 120, left: left }
    case "bottom":
      return { top: top + rect.height + margin, left: left }
    case "left":
      return { top: top, left: left - 280 - margin }
    case "right":
      return { top: top, left: left + rect.width + margin }
    default:
      return { top: top + rect.height + margin, left: left }
  }
}

// Export the client component with proper isolation
export default function AppTour() {
  return <AppTourClient />
}


