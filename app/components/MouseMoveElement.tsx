'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function MouseMoveElement() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY })
    }

    window.addEventListener('mousemove', updateMousePosition)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
    }
  }, [])

  return (
    <motion.div
      className="fixed w-8 h-8 rounded-full bg-white mix-blend-difference pointer-events-none z-50"
      animate={{
        x: mousePosition.x - 16,
        y: mousePosition.y - 16,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    />
  )
}
