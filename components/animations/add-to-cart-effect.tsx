"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface FlyingItem {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
}

const AddToCartAnimationContext = React.createContext<{
  triggerAnimation: (startX: number, startY: number) => void
} | null>(null)

export function AddToCartAnimationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<FlyingItem[]>([])

  const triggerAnimation = React.useCallback((startX: number, startY: number) => {
    // Attempt to find the cart icon in the DOM to set end coordinates
    const cartElement = document.getElementById("cart-icon")
    let endX = window.innerWidth - 50
    let endY = 50

    if (cartElement) {
      const rect = cartElement.getBoundingClientRect()
      endX = rect.left + rect.width / 2
      endY = rect.top + rect.height / 2
    }

    const newItem: FlyingItem = {
      id: Math.random().toString(36).substr(2, 9),
      startX,
      startY,
      endX,
      endY,
    }

    setItems((prev) => [...prev, newItem])

    // Remove the item after animation completes
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== newItem.id))
    }, 800) // Duration should match the transition
  }, [])

  return (
    <AddToCartAnimationContext.Provider value={{ triggerAnimation }}>
      {children}
      {/* Portals or fixed overlay for animations */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ x: item.startX, y: item.startY, scale: 1, opacity: 1 }}
              animate={{
                x: item.endX,
                y: item.endY,
                scale: 0.2,
                opacity: 0.5,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.175, 0.885, 0.32, 1.275], // Custom bouncy ease
              }}
              className="absolute h-6 w-6 rounded-full bg-primary shadow-lg"
            />
          ))}
        </AnimatePresence>
      </div>
    </AddToCartAnimationContext.Provider>
  )
}

export function useAddToCartAnimation() {
  const context = React.useContext(AddToCartAnimationContext)
  if (!context) {
    throw new Error("useAddToCartAnimation must be used within an AddToCartAnimationProvider")
  }
  return context
}
