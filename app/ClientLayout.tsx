'use client'

import { AnimatePresence, motion } from 'framer-motion'
import MouseMoveElement from './components/MouseMoveElement'
import Scene from './components/Scene'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
      <>
        <Scene />
        <MouseMoveElement />
        <AnimatePresence mode="wait">
          <motion.main
            className="min-h-screen flex flex-col items-center justify-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </>
    )
  }
