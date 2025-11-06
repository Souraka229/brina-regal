'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-dark/90 backdrop-blur-md fixed w-full z-50 border-b border-gold/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-gold to-orange rounded-full flex items-center justify-center">
              <span className="text-dark font-bold text-sm">BR</span>
            </div>
            <span className="text-2xl font-poppins font-bold gradient-text">
              Brina'Régal
            </span>
          </Link>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-cream hover:text-gold transition-colors duration-300">
              Accueil
            </Link>
            <Link href="/menu" className="text-cream hover:text-gold transition-colors duration-300">
              Menu
            </Link>
            <Link 
              href="/menu" 
              className="bg-gradient-to-r from-gold to-orange text-dark px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Commander
            </Link>
          </div>

          {/* Menu mobile */}
          <button 
            className="md:hidden text-cream text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Menu mobile dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 space-y-4 pb-4"
            >
              <Link 
                href="/" 
                className="block text-cream hover:text-gold py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                href="/menu" 
                className="block text-cream hover:text-gold py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Menu
              </Link>
              <Link 
                href="/menu" 
                className="block bg-gradient-to-r from-gold to-orange text-dark px-4 py-3 rounded-full text-center font-semibold mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Commander
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
